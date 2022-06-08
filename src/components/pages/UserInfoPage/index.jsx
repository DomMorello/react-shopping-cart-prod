import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { theme } from "style";

import { BASE_SERVER_URL, SERVER_PATH, ROUTES, RANGE } from "constants";

import { useStore } from "hooks/useStore";
import { checkUserName } from "validator";
import { deleteUser, USER_ACTION } from "reducers/user";
import { updateUserBaseServer } from "util/fetch";

import DefaultButton from "components/common/Button/DefaultButton";
import PageHeader from "components/common/PageHeader";
import UserForm from "components/common/UserForm";
import UserInput from "components/common/UserInput";
import Spinner from "components/common/Spinner";
import {
  DeleteAccountButton,
  UserInfoButtonContainer,
  UserInfoInputContainer,
  UserInfoLabel,
  UserInfoPageContainer,
} from "./styled";
import DeleteAccountModal from "./DeleteAccountModal";

function UserInfoPage() {
  const {
    data: user,
    isLoading,
    errorMessage: serverError,
    dispatch,
  } = useStore("user");
  const navigator = useNavigate();
  const [isEditable, setIsEditable] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [errorMessage, setErrorMessage] = useState("");
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);

  const handleUsernameChange = ({ target: { value } }) => {
    try {
      checkUserName(value);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
    setUsername(value);
  };

  const changeUsername = (e) => {
    e.preventDefault();

    if (user.username !== username) {
      requestUpdateUser();
      return;
    }
    setIsEditable(false);
  };

  const requestUpdateUser = async () => {
    dispatch({ type: USER_ACTION.UPDATE_USER_INFO });
    try {
      const response = await updateUserBaseServer({
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        url: `${BASE_SERVER_URL}${SERVER_PATH.CUSTOMER_LIST}/${user.id}`,
        body: JSON.stringify({ username: username }),
      });

      const data = await response.json();
      if (data.message) {
        setErrorMessage(data.message);
        dispatch({
          type: USER_ACTION.UPDATE_USER_INFO_ERROR,
          errorMessage: data.message,
        });
        return;
      }
      dispatch({
        type: USER_ACTION.UPDATE_USER_INFO_SUCCESS,
        username: data.username,
      });
      setIsEditable(false);
    } catch (error) {
      dispatch({
        type: USER_ACTION.UPDATE_USER_INFO_ERROR,
        errorMessage: error.message,
      });
      alert("문제가 발생했습니다. 다시 접속해주세요");
    }
  };

  const handleCancleEdit = () => {
    setUsername(user.username);
    dispatch({ type: USER_ACTION.CLEAN_ERROR });
    setErrorMessage("");
    setIsEditable(false);
  };

  const deleteAccount = () => {
    dispatch(deleteUser(user.id, user.accessToken, passwordRef.current.value));
  };

  const closeModal = () => {
    setIsOpenModal(false);
    dispatch({ type: USER_ACTION.CLEAN_ERROR });
    setErrorMessage("");
    setIsEditable(false);
  };

  useEffect(() => {
    if (isEditable) {
      usernameRef.current.focus();
    }
  }, [isEditable]);

  useEffect(() => {
    setUsername(user.username);
  }, [user.username]);

  useEffect(() => {
    if (!user.accessToken) {
      navigator(ROUTES.ROOT, { replace: true });
    }
  }, [user.accessToken]);

  useEffect(() => {
    return () => {
      dispatch({ type: USER_ACTION.CLEAN_ERROR });
    };
  }, []);

  return (
    <UserInfoPageContainer>
      <PageHeader>{isEditable ? "회원정보 수정" : "회원정보"}</PageHeader>
      {isLoading && <Spinner />}
      <UserForm onSubmit={changeUsername}>
        <UserInfoInputContainer>
          <UserInfoLabel>이메일</UserInfoLabel>
          <UserInput
            width="500px"
            placeholder="이메일을 입력해주세요"
            value={user.email}
            disabled
          />
        </UserInfoInputContainer>
        <UserInfoInputContainer>
          <UserInfoLabel>닉네임</UserInfoLabel>
          <UserInput
            width="500px"
            placeholder="닉네임을 입력해주세요"
            value={username}
            onChange={handleUsernameChange}
            disabled={!isEditable}
            minLength={RANGE.USERNAME_MIN_LENGTH}
            maxLength={RANGE.USERNAME_MAX_LENGTH}
            errorMessage={errorMessage}
            autoFocus
            ref={usernameRef}
          />
        </UserInfoInputContainer>
        <UserInfoButtonContainer>
          {isEditable ? (
            <>
              <DefaultButton key="confirmEdit" type="submit" width="500px">
                수정확인
              </DefaultButton>
              <DefaultButton
                type="button"
                width="500px"
                bgColor={theme.color.main}
                textColor={theme.color.point}
                onClick={handleCancleEdit}
              >
                수정취소
              </DefaultButton>
            </>
          ) : (
            <>
              <DefaultButton
                key="edit"
                width="500px"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditable(true);
                }}
              >
                수정하기
              </DefaultButton>
              <DeleteAccountButton
                type="button"
                onClick={() => {
                  setIsOpenModal(true);
                }}
              >
                탈퇴하기
              </DeleteAccountButton>
            </>
          )}
        </UserInfoButtonContainer>
      </UserForm>
      {isOpenModal && (
        <DeleteAccountModal
          onClose={closeModal}
          onConfirm={deleteAccount}
          errorMessage={serverError}
          userName={user.username}
          passwordRef={passwordRef}
        />
      )}
    </UserInfoPageContainer>
  );
}

export default UserInfoPage;
