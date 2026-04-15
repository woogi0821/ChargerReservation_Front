import * as Yup from "yup";

// 공백제외, 특수문자 포함
const idRegExp = /^(?=.*[a-zA-Z])[a-zA-Z0-9]*$/;
const passwordRegExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;

// 로그인 전용 검증
export const loginValidation = Yup.object().shape({
  loginId: Yup.string()
    // .matches(idRegExp, "영문을 포함한 영문/숫자 조합이어야 합니다.")
    .required("아이디는 필수 입력 항목입니다."),
  loginPw: Yup.string()
    .required("비밀번호는 필수 입력 항목입니다."),
});

// 회원가입 전용 검증
export const authValidation = Yup.object().shape({
  loginId: Yup.string()
    .matches(idRegExp, "공백 및 특수 문자는 사용할 수 없습니다.")
    .required("아이디는 필수 입력 항목입니다.")
    .min(4, "아이디는 4자 이상이어야 합니다."),
  loginPw: Yup.string()
    .matches(passwordRegExp, "영문, 숫자, 특수문자를 포함하여 8~15자로 입력해주세요.")
    .required("비밀번호는 필수 입력 항목입니다.")
    .min(8, "비밀번호는 8자 이상이어야 합니다."),
  confirmPw: Yup.string()
    .oneOf([Yup.ref("loginPw")], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호 확인은 필수입니다."),
  name: Yup.string()
    .trim()
    .required("이름은 필수 입력 항목입니다."),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "전화번호 형식이 올바르지 않습니다. (- 제외)")
    .required("전화번호는 필수 입력 항목입니다."),
  email: Yup.string()
    .trim()
    .email("이메일 형식이 올바르지 않습니다.")
    .required("이메일은 필수 입력 항목입니다."),
  authCode: Yup.string()
    .matches(/^\d{6}$/, "인증번호는 숫자 6자리여야 합니다.")
    .required("인증번호를 입력해주세요."),
});

export default authValidation;