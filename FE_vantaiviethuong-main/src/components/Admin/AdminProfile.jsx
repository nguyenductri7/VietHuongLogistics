import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2,
  LogOut, Mail, Save, ShieldCheck, UserRound,
} from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminProfile.module.scss'
import { useAdminToast } from './AdminToast'

const INITIAL_PASSWORD_FORM = {
  current_password: '',
  new_password: '',
  confirm_password: '',
}

export default function AdminProfile() {
  const { showToast } = useAdminToast()
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  })
  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setProfile({
      full_name: user?.full_name || '',
      email: user?.email || '',
    })
  }, [user])

  const initials = useMemo(() => {
    const source = user?.full_name || user?.username || 'A'
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'A'
  }, [user])


  const handleProfileChange = (key, value) => {
    setProfile(current => ({ ...current, [key]: value }))
  }

  const handlePasswordChange = (key, value) => {
    setPasswordForm(current => ({ ...current, [key]: value }))
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const res = await authApi.updateProfile(profile)
      updateUser?.(res.user)
      showToast(res.message || 'Đã cập nhật hồ sơ admin.')
    } catch (error) {
      showToast(error.message || 'Không thể cập nhật hồ sơ.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('Mật khẩu xác nhận chưa khớp.', 'error')
      return
    }

    if (passwordForm.new_password.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error')
      return
    }

    setSavingPassword(true)
    try {
      const res = await authApi.changePassword(
        passwordForm.current_password,
        passwordForm.new_password,
      )
      setPasswordForm(INITIAL_PASSWORD_FORM)
      showToast(res.message || 'Đã đổi mật khẩu.')
    } catch (error) {
      showToast(error.message || 'Không thể đổi mật khẩu.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <UserRound size={22} /> Hồ sơ Admin
          </h1>
          <p className={styles.subtitle}>Quản lý thông tin tài khoản và bảo mật đăng nhập.</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={15} /> Đăng xuất
        </button>
      </header>

      <div className={styles.layout}>
        <aside className={styles.profileCard}>
          <div className={styles.avatar}>{initials}</div>
          <h2>{user?.full_name || user?.username || 'Admin'}</h2>
          <p>{user?.email || 'Chưa cập nhật email'}</p>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Tên đăng nhập</span>
              <strong>{user?.username || 'admin'}</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Vai trò</span>
              <strong>{user?.role || 'admin'}</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Trạng thái</span>
              <strong className={styles.activeStatus}>
                <CheckCircle2 size={14} /> Đang hoạt động
              </strong>
            </div>
          </div>
        </aside>

        <main className={styles.content}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div className={styles.panelIcon}><UserRound size={18} /></div>
              <div>
                <h2>Thông tin tài khoản</h2>
                <p>Cập nhật họ tên và email dùng cho tài khoản admin.</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSaveProfile}>
              <label className={styles.field}>
                <span>Họ và tên</span>
                <div className={styles.inputWrap}>
                  <UserRound size={16} />
                  <input
                    value={profile.full_name}
                    onChange={event => handleProfileChange('full_name', event.target.value)}
                    placeholder="Nhập họ tên admin"
                    maxLength={100}
                  />
                </div>
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <div className={styles.inputWrap}>
                  <Mail size={16} />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={event => handleProfileChange('email', event.target.value)}
                    placeholder="admin@viethuonglogistics.com"
                    maxLength={100}
                  />
                </div>
              </label>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled={savingProfile}>
                  {savingProfile ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                  Lưu thông tin
                </button>
              </div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div className={styles.panelIcon}><ShieldCheck size={18} /></div>
              <div>
                <h2>Bảo mật tài khoản</h2>
                <p>Đổi mật khẩu định kỳ để bảo vệ trang quản trị.</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleChangePassword}>
              <label className={styles.field}>
                <span>Mật khẩu hiện tại</span>
                <div className={styles.inputWrap}>
                  <KeyRound size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={event => handlePasswordChange('current_password', event.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              <label className={styles.field}>
                <span>Mật khẩu mới</span>
                <div className={styles.inputWrap}>
                  <KeyRound size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={event => handlePasswordChange('new_password', event.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label className={styles.field}>
                <span>Xác nhận mật khẩu mới</span>
                <div className={styles.inputWrap}>
                  <KeyRound size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={event => handlePasswordChange('confirm_password', event.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(value => !value)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              <div className={styles.note}>
                Gợi ý: nên dùng mật khẩu có chữ hoa, chữ thường, số và ký tự đặc biệt.
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled={savingPassword}>
                  {savingPassword ? <Loader2 size={15} className={styles.spin} /> : <KeyRound size={15} />}
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}
