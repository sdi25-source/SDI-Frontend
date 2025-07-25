import { Authority } from '@/shared/security/authority';

const Register = () => import('@/account/register/register.vue');
const Login = () => import('@/account/login-form/login-form.vue');
const Activate = () => import('@/account/activate/activate.vue');
const ResetPasswordInit = () => import('@/account/reset-password/init/reset-password-init.vue');
const ResetPasswordFinish = () => import('@/account/reset-password/finish/reset-password-finish.vue');
const ChangePassword = () => import('@/account/change-password/change-password.vue');
const Settings = () => import('@/account/settings/settings.vue');
const AccountLayout = () => import('@/account/accountLayout/AccountLayout.vue');

export default [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/account/activate',
    name: 'Activate',
    component: Activate,
  },
  {
    path: '/account/reset/request',
    name: 'ResetPasswordInit',
    component: ResetPasswordInit,
  },
  {
    path: '/account/reset/finish',
    name: 'ResetPasswordFinish',
    component: ResetPasswordFinish,
  },
  {
    path: '/account/password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { authorities: [Authority.USER, Authority.COMMERCIAL] },
  },
  {
    path: '/account/settings',
    name: 'Settings',
    component: Settings,
    meta: { authorities: [Authority.USER, Authority.COMMERCIAL] },
  },
  {
    path: '/account/profile',
    name: 'Profile',
    component: AccountLayout,
    meta: { authorities: [Authority.USER, Authority.COMMERCIAL] },
  },
];
