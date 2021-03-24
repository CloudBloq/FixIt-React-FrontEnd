import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios'
import { auth } from '../../helpers/Firebase';

import {
  LOGIN_USER,
  REGISTER_USER,
  LOGOUT_USER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
} from '../actions';

import {
  loginUserSuccess,
  loginUserError,
  registerUserSuccess,
  registerUserError,
  forgotPasswordSuccess,
  forgotPasswordError,
  resetPasswordSuccess,
  resetPasswordError,
} from './actions';

import { adminRoot, currentUser } from '../../constants/defaultValues';
import { setCurrentUser } from '../../helpers/Utils';

export function* watchLoginUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGIN_USER, loginWithEmailPassword);
}


const loginWithEmailPasswordAsync = async (username, password) => {
  const loginUser=await axios.post("http://localhost:5000/api/users/authenticate", {
    username,password
    
  })
  
  .catch((error)=> error)
  console.log("Login User from the Login Function" , loginUser)

  return loginUser;
}
  






function* loginWithEmailPassword({ payload }) {

  const { email, password } = payload.user;
  const { history } = payload;
  const message="Username or password is incorrect";
  try {
    const loginUser = yield call(loginWithEmailPasswordAsync, email, password);
    console.log("Login User" , loginUser);
    if (loginUser.data) {
      const item = { uid: loginUser.data.user.userId,title: loginUser.data.user.fullName ?  loginUser.data.user.fullName : "Yared Solomon Mulu",...currentUser };
      setCurrentUser(item);
      yield put(loginUserSuccess(item));
      history.push(adminRoot);
    } else {
      yield put(loginUserError(message));
    }
  } catch (error) {
    yield put(loginUserError(message));
  }
}

















export function* watchRegisterUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REGISTER_USER, registerWithEmailPassword);
}

const registerWithEmailPasswordAsync =  async (fullName,email, password,roleId) => {
  const users=await axios.post("http://localhost:5000/api/users/", {
    fullName,email,password,roleId
  
})
  
.catch((error)=> error)
console.log("Login User from the Login Function" , users)
return users;
}








function* registerWithEmailPassword({ payload }) {
  console.log("Register saga");
  const { email, password,name} = payload.user;
  const roleId=1
  console.log("User Information", payload);
  const { history } = payload;
  try {
    
    const registerUser = yield call(
      registerWithEmailPasswordAsync,
      name,
      email,
      password,
      roleId
    );
    console.log(registerUser.data);
    if (registerUser) {
      const item = { uid: registerUser.userId,title:registerUser.fullName, ...currentUser };
      setCurrentUser(item);
      yield put(registerUserSuccess(item));
      history.push('/user');
    } else {
      yield put(registerUserError(registerUser.message));
    }
  } catch (error) {
    yield put(registerUserError(error));
  }
}






















export function* watchLogoutUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGOUT_USER, logout);
}

const logoutAsync = async (history) => {
  // await auth
    // .signOut()
    // .then((user) => user)
    // .catch((error) => error);
  history.push("/user");
};

function* logout({ payload }) {
  const { history } = payload;
  setCurrentUser();
  yield call(logoutAsync, history);
}

export function* watchForgotPassword() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(FORGOT_PASSWORD, forgotPassword);
}

const forgotPasswordAsync = async (email) => {
  // eslint-disable-next-line no-return-await
  return await auth
    .sendPasswordResetEmail(email)
    .then((user) => user)
    .catch((error) => error);
};

function* forgotPassword({ payload }) {
  const { email } = payload.forgotUserMail;
  try {
    const forgotPasswordStatus = yield call(forgotPasswordAsync, email);
    if (!forgotPasswordStatus) {
      yield put(forgotPasswordSuccess('success'));
    } else {
      yield put(forgotPasswordError(forgotPasswordStatus.message));
    }
  } catch (error) {
    yield put(forgotPasswordError(error));
  }
}

export function* watchResetPassword() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(RESET_PASSWORD, resetPassword);
}

const resetPasswordAsync = async (resetPasswordCode, newPassword) => {
  // eslint-disable-next-line no-return-await
  return await auth
    .confirmPasswordReset(resetPasswordCode, newPassword)
    .then((user) => user)
    .catch((error) => error);
};

function* resetPassword({ payload }) {
  const { newPassword, resetPasswordCode } = payload;
  try {
    const resetPasswordStatus = yield call(
      resetPasswordAsync,
      resetPasswordCode,
      newPassword
    );
    if (!resetPasswordStatus) {
      yield put(resetPasswordSuccess('success'));
    } else {
      yield put(resetPasswordError(resetPasswordStatus.message));
    }
  } catch (error) {
    yield put(resetPasswordError(error));
  }
}

export default function* rootSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgotPassword),
    fork(watchResetPassword),
  ]);
}
