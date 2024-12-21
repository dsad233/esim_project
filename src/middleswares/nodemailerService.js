import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { sendService, port, user, pass, title, context } = process.env;

// 메일발송 객체
  async function sendmailer (email) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',   // 메일 보내는 곳
      prot: 587,
      host: 'smtp.gmlail.com',  
      secure: false,  
      requireTLS: true ,
      auth: {
        user: senderInfo.user,  // 보내는 메일의 주소
        pass: senderInfo.pass   // 보내는 메일의 비밀번호
      }
    });
    // 메일 옵션
    const mailOptions = {
      from: senderInfo.user, // 보내는 메일의 주소
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text // 메일 내용
    };
    
    // 메일 발송    
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('이메일 전송 완료' + info.response);
      }
    });

  }

export default sendmailer;




