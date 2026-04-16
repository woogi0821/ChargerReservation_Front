import * as yup from "yup";

const carNumberRegex = /^[0-9]{2,3}[가-히]{1}[0-9]{4}$/;

export const reservationValidation = yup.object({
    carNumber : yup
    .string()
    .matches(carNumberRegex, "올바른 차량 번호 형식이 아닙니다. (예: 12가3456)")
    .required("차량번호를 입력해주세요."),

    pin : yup
    .string()
    .matches(/^[0-9]{4}$/,"PIN번호는 숫자 4자리만 입력 가능합니다.")
    .required("현장 인증용 PIN번호 4자리를 설정해주세요."),

    gusetName : yup
    .string().when('isGuest',{is : true, then : (Schema : yup.StringSchema) => Schema.required("비회원 예약자명을 입력해주세요."),
        otherwise : (Schema:yup.StringSchema) => Schema.notRequired(),
    }),

})