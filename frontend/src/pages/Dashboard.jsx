import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Upload, CheckCircle, Trophy, Activity, Clock, Download } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import AnimatedContainer, { HoverScale } from '../components/common/AnimatedContainer';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_FILE_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
]);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [userRes, coursesRes, filesRes, storageRes] = await Promise.all([
          fetch('/api/v1/users/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/courses/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/files/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/files/storage-status', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (userRes.ok && coursesRes.ok && filesRes.ok) {
          const userData = await userRes.json();
          const coursesData = await coursesRes.json();
          const filesData = await filesRes.json();
          const storageData = storageRes.ok ? await storageRes.json() : null;
          setUser(userData);
          setCourses(coursesData);
          setUploadedFiles(filesData);
          setStorageStatus(storageData);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const openFilePicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const refreshUploadedFiles = async (token) => {
    const filesRes = await fetch('/api/v1/files/', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!filesRes.ok) {
      throw new Error('Could not refresh uploaded files');
    }
    const filesData = await filesRes.json();
    setUploadedFiles(filesData);
  };

  const getFileTypeError = (file) => {
    const hasKnownMime = file.type && SUPPORTED_FILE_TYPES.has(file.type);
    const isAllowedExtension = /\.(pdf|txt|doc|docx|ppt|pptx|xls|xlsx|zip)$/i.test(file.name);
    if (hasKnownMime || isAllowedExtension) return '';
    return 'Unsupported file type. Upload PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, or ZIP.';
  };

  const uploadToS3WithProgress = (url, formData, onProgress) => (
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('File upload failed at storage layer'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error while uploading file'));
      xhr.send(formData);
    })
  );

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSelectedFileName(file.name);
    setUploadStatus('');
    setUploadError('');
    setUploadProgress(0);
    setIsUploading(true);

    try {
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error('File is too large. Maximum allowed size is 10 MB.');
      }
      const fileTypeError = getFileTypeError(file);
      if (fileTypeError) {
        throw new Error(fileTypeError);
      }

      const metadataRes = await fetch('/api/v1/files/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          file_type: file.type || 'application/octet-stream',
        }),
      });

      if (!metadataRes.ok) {
        const errorData = await metadataRes.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Unable to initialize file upload');
      }

      const metadata = await metadataRes.json();
      const uploadFormData = new FormData();

      Object.entries(metadata.upload_data.fields).forEach(([key, value]) => {
        uploadFormData.append(key, value);
      });
      uploadFormData.append('file', file);

      await uploadToS3WithProgress(metadata.upload_data.url, uploadFormData, (percent) => {
        setUploadProgress(percent);
      });

      setUploadStatus('File uploaded successfully.');
      await refreshUploadedFiles(token);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (fileId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setUploadError('');
    setDownloadingFileId(fileId);
    try {
      let res = await fetch(`/api/v1/files/${fileId}/download-url`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 404) {
        // Compatibility fallback for older backend route conventions.
        res = await fetch(`/api/v1/files/download-url/${fileId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 404 && (errorData.detail === 'Not Found' || !errorData.detail)) {
          throw new Error('Download endpoint not available on backend. Restart backend server.');
        }
        throw new Error(errorData.detail || 'Unable to prepare download link');
      }
      const data = await res.json();
      window.open(data.download_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setUploadError(err.message || 'Unable to download file');
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading Portal...</div>;

  return (
    <AnimatedContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <section>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Hello, {user?.username}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here is what is happening with your academic journey today.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <HoverScale>
            <StatCard
              title="Total Courses"
              value={user?.stats?.total_courses || 0}
              icon={BookOpen}
              color="#4f46e5"
            />
          </HoverScale>
          <HoverScale>
            <StatCard
              title="Avg. Progress"
              value={`${user?.stats?.avg_progress || 0}%`}
              icon={Trophy}
              color="#10b981"
            />
          </HoverScale>
          <HoverScale>
            <StatCard
              title="Active Tasks"
              value={user?.stats?.active_courses || 0}
              icon={Activity}
              color="#f43f5e"
            />
          </HoverScale>
          <HoverScale>
            <StatCard
              title="Hours Logged"
              value="12.5h"
              icon={Clock}
              color="#0ea5e9"
            />
          </HoverScale>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen color="var(--primary)" /> Enrolled Courses
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>You are not enrolled in any courses yet.</p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-glass)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Progress: 0%</p>
                    </div>
                    <button className="btn btn-glass" style={{ padding: '0.5rem 1rem' }}>View</button>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={18} /> Quick Upload
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Submit your latest assignment here.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={openFilePicker}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </button>
              {isUploading && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                    Upload progress: {uploadProgress}%
                  </p>
                </div>
              )}
              {selectedFileName && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
                  Selected: {selectedFileName}
                </p>
              )}
              {uploadStatus && (
                <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                  {uploadStatus}
                </p>
              )}
              {uploadError && (
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
                  {uploadError}
                </p>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} /> Recent Uploads
              </h3>
              {storageStatus && !storageStatus.ok && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                  S3 Access: {storageStatus.message}
                </p>
              )}
              {uploadedFiles.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No files uploaded yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {uploadedFiles.slice().reverse().slice(0, 5).map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleDownload(file.id)}
                      className="btn btn-glass"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        justifyContent: 'space-between',
                        display: 'inline-flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', minWidth: 0 }}>
                        <Download size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.filename}
                        </span>
                      </span>
                      {downloadingFileId === file.id && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Opening...</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> Announcements
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p>- Final exams start next week.</p>
                <p style={{ marginTop: '0.5rem' }}>- New course materials uploaded for CS101.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Dashboard;
