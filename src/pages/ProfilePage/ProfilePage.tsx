import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUpdateProfile } from '@/hooks/users/useUpdateProfile';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { Button, Input, Modal } from '@/components/UI';

import styles from './ProfilePage.module.css';

import {
  ArrowLeft,
  Camera,
  User,
  Lock,
  LogOut,
  Trash2,
  Mail,
  Pencil,
  ChevronRight,
  AlertCircle,
  AtSign,
  ShieldCheck,
} from 'lucide-react';
import type { ProfileUpdateData } from '@/api/userApi';
import { userApi } from '@/api/userApi';
import { authApi } from '@/api/authApi';

type ModalType = 'username' | 'name' | 'email' | 'password' | 'delete' | null;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { logout } = useLogout();

  const { updateProfile, isLoading: loading } = useUpdateProfile();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fieldValues, setFieldValues] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const open = (modal: ModalType) => {
    setErrors({});
    setActiveModal(modal);
  };

  const close = () => {
    setActiveModal(null);
    setErrors({});
    setDeleteConfirm('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      e.target.value = '';

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);

      setAvatarUploading(true);
      try {
        const updated = await userApi.uploadAvatar(file);
        updateUser({ avatar_url: updated.avatar_url });
        setAvatarPreview(null);
        toast.success('Avatar updated');
      } catch (err) {
        setAvatarPreview(null);
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setAvatarUploading(false);
      }
    },
    [updateUser]
  );

  const saveField = (
    field: keyof ProfileUpdateData,
    value: string,
    label: string
  ) => {
    if (!value.trim()) {
      setErrors({ [field]: `${label} is required` });
      return;
    }

    updateProfile(
      { [field]: value },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          setFieldValues((prev) => ({ ...prev, [field]: value }));
          toast.success(`${label} updated`);
          close();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Update failed');
        },
      }
    );
  };

  const savePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) newErrors.currentPassword = 'Required';
    if (passwordData.newPassword.length < 6)
      newErrors.newPassword = 'Minimum 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile(
      {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
      },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast.success('Password changed');
          close();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Update failed');
        },
      }
    );
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      close();
      await logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete account'
      );
    }
  };

  if (!user) return null;

  const avatarUrl = avatarPreview || user.avatar_url;
  const initials = user.username.charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Back
          </button>

          <div
            className={styles.avatarSection}
            onClick={() => !avatarUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <div className={styles.avatarRing}>
              <div className={styles.avatarInner}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.avatarInitials}>{initials}</span>
                )}
              </div>
            </div>
            <div className={styles.avatarCameraHint}>
              <Camera size={13} />
              {avatarUploading ? 'Uploading...' : 'Change photo'}
            </div>
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.display_name}</div>
            <div className={styles.userHandle}>@{user.username}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>

          <div className={styles.navDivider} />

          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${styles.navActive}`}>
              <User className={styles.navSvg} size={18} />
              Profile
            </button>
            <button className={styles.navItem} onClick={() => open('password')}>
              <Lock className={styles.navSvg} size={18} />
              Security
            </button>
          </nav>

          <div className={styles.navDivider} />

          <nav className={styles.nav}>
            <button
              className={styles.navItem}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              <LogOut className={styles.navSvg} size={18} />
              Log out
            </button>
            <button
              className={`${styles.navItem} ${styles.navDanger}`}
              onClick={() => open('delete')}
            >
              <Trash2 size={18} />
              Delete account
            </button>
          </nav>
        </div>

        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <User className={styles.navSvg} size={18} />
              </div>
              <div>
                <h1 className={styles.cardTitle}>Profile information</h1>
                <p className={styles.cardSub}>Manage your personal details</p>
              </div>
            </div>

            <div className={styles.fieldList}>
              <div className={styles.fieldRow} onClick={() => open('username')}>
                <div className={styles.fieldIconWrap}>
                  <AtSign className={styles.navSvg} size={18} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Username</span>
                  <span className={styles.fieldValue}>@{user.username}</span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>

              <div className={styles.fieldRow} onClick={() => open('name')}>
                <div className={styles.fieldIconWrap}>
                  <Pencil className={styles.navSvg} size={16} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Display name</span>
                  <span className={styles.fieldValue}>{user.display_name}</span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>

              <div className={styles.fieldRow} onClick={() => open('email')}>
                <div className={styles.fieldIconWrap}>
                  <Mail className={styles.navSvg} size={16} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Email address</span>
                  <span className={styles.fieldValue}>{user.email}</span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <ShieldCheck className={styles.navSvg} size={18} />
              </div>
              <div>
                <h1 className={styles.cardTitle}>Security</h1>
                <p className={styles.cardSub}>Keep your account protected</p>
              </div>
            </div>

            <div className={styles.fieldList}>
              <div className={styles.fieldRow} onClick={() => open('password')}>
                <div className={styles.fieldIconWrap}>
                  <Lock className={styles.navSvg} size={18} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Password</span>
                  <span className={`${styles.fieldValue} ${styles.fieldMuted}`}>
                    ••••••••
                  </span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <AlertCircle className={styles.navSvg} size={18} />
              </div>
              <div>
                <h1 className={styles.cardTitle}>Account</h1>
                <p className={styles.cardSub}>Manage your account settings</p>
              </div>
            </div>

            <div className={styles.fieldList}>
              <div
                className={styles.fieldRow}
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                <div className={styles.fieldIconWrap}>
                  <LogOut className={styles.navSvg} size={16} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Session</span>
                  <span className={styles.fieldValue}>
                    Log out of your account
                  </span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>

              <div
                className={`${styles.fieldRow} ${styles.fieldRowDanger}`}
                onClick={() => open('delete')}
              >
                <div
                  className={`${styles.fieldIconWrap} ${styles.fieldIconDanger}`}
                >
                  <Trash2 size={16} />
                </div>
                <div className={styles.fieldBody}>
                  <span className={styles.fieldLabel}>Danger zone</span>
                  <span
                    className={`${styles.fieldValue} ${styles.fieldDanger}`}
                  >
                    Delete account permanently
                  </span>
                </div>
                <ChevronRight className={styles.fieldChevron} size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={activeModal === 'username'}
        onClose={close}
        title="Change username"
        size="sm"
      >
        <div className={styles.form}>
          <Input
            label="New username"
            value={fieldValues.username}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, username: e.target.value })
            }
            error={errors.username}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={() =>
                saveField('username', fieldValues.username, 'Username')
              }
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'name'}
        onClose={close}
        title="Change display name"
        size="sm"
      >
        <div className={styles.form}>
          <Input
            label="Display name"
            value={fieldValues.display_name}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, display_name: e.target.value })
            }
            error={errors.display_name}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={() =>
                saveField(
                  'display_name',
                  fieldValues.display_name,
                  'Display name'
                )
              }
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'email'}
        onClose={close}
        title="Change email"
        size="sm"
      >
        <div className={styles.form}>
          <Input
            label="Email address"
            type="email"
            value={fieldValues.email}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, email: e.target.value })
            }
            error={errors.email}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={() => saveField('email', fieldValues.email, 'Email')}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'password'}
        onClose={close}
        title="Change password"
        size="sm"
      >
        <div className={styles.form}>
          <Input
            label="Current password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
            error={errors.currentPassword}
          />
          <Input
            label="New password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            error={errors.newPassword}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
            error={errors.confirmPassword}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button loading={loading} onClick={savePassword}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'delete'}
        onClose={close}
        title="Delete account"
        size="sm"
      >
        <div className={styles.form}>
          <p className={styles.deleteText}>
            This will permanently delete your account and all your data. This
            action cannot be undone.
          </p>
          <Input
            label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
