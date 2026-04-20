import * as Yup from "yup";

const passwordRegExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;

// 회원 수정
export const updateValidation = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("이름은 필수 입력 항목입니다."),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "전화번호 형식이 올바르지 않습니다. (- 제외)")
    .required("전화번호는 필수 입력 항목입니다."),
  loginPw: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .matches(passwordRegExp, "영문, 숫자, 특수문자를 포함하여 8~15자로 입력해주세요."),
  confirmPw: Yup.string()
    .oneOf([Yup.ref("loginPw")], "비밀번호가 일치하지 않습니다.")
    .when("loginPw", {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.required("비밀번호 확인은 필수입니다."),
    }),
});

// 아이디 찾기
export const findIdValidation = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("이름은 필수 입력 항목입니다."),
  email: Yup.string()
    .trim()
    .email("이메일 형식이 올바르지 않습니다.")
    .required("이메일은 필수 입력 항목입니다."),
});

// 비밀번호 찾기(임시 비번 발송)
export const findPwValidation = Yup.object().shape({
  loginId: Yup.string()
    .required("아이디는 필수 입력 항목입니다."),
  phone: Yup.string()
    .matches(/^\d{10,11}$/, "전화번호 형식이 올바르지 않습니다. (- 제외)")
    .required("전화번호는 필수 입력 항목입니다."),
  email: Yup.string()
    .trim()
    .email("이메일 형식이 올바르지 않습니다.")
    .required("이메일은 필수 입력 항목입니다."),
});