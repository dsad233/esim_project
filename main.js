import express from "express";
import sendMailer from "./src/middleswares/nodemailerService.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.listen(port, () => {
    console.log(port, "포트로 서버가 구동 중 입니다.");
});



// 전송 받은 메일로 메일 전송
app.post('/sendmail', async (req, res, next) => {
    try {
        const { customerEmail } = req.body;

        if(!customerEmail) {
            return res.status(400).json({ message : "고객의 이메일을 작성해주세요." });
        }

        if (
            !customerEmail.includes("@naver.com") &&
            !customerEmail.includes("@daum.net") &&
            !customerEmail.includes("@google.com") &&
            !customerEmail.includes("@gmail.com") &&
            !customerEmail.includes("@googlemail.com") &&
            !customerEmail.includes("@hanmail.net") &&
            !customerEmail.includes("@icloud.com") &&
            !customerEmail.includes("@cyworld.com") &&
            !customerEmail.includes("@kakao.com") &&
            !customerEmail.includes("@mail.com") &&
            !customerEmail.includes("@narasarang.or.kr") &&
            !customerEmail.includes("@tistory.com")
        ) {
            return res.status(400).json({ message: "이메일 조건이 맞지 않습니다. 다시 작성해 주세요." });
        }

        await sendMailer(customerEmail);
        return res.status(200).json({ message : "메일 전송 완료." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message : "메일 전송 오류 발생! 고객 센터에 문의 해주세요." });
    }
});

