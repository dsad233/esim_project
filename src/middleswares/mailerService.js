import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { SYSTEM_EMAIL_SERVICE, SYSTEM_EMAIL_PORT, SYSTEM_EMAIL_HOST, SYSTEM_EMAIL_USER, SYSTEM_EMAIL_APPPASS, title, context } = process.env;

// 메일발송 객체
  async function sendMailer (email) {
    const transporter = nodemailer.createTransport({
      service: SYSTEM_EMAIL_SERVICE,   // 메일 보내는 곳
      prot: SYSTEM_EMAIL_PORT,
      host: SYSTEM_EMAIL_HOST,  
      secure: false,  
      requireTLS: true ,
      auth: {
        user: SYSTEM_EMAIL_USER,  // 보내는 메일의 주소
        pass: SYSTEM_EMAIL_APPPASS   // 보내는 메일의 비밀번호
      }
    });
    // 메일 옵션
    const mailOptions = {
      from: SYSTEM_EMAIL_USER, // 보내는 메일의 주소
      to: email, // 수신할 이메일
      subject: title, // 메일 제목
      text: context // 메일 내용
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

  // S3 이용해서 첨부파일을 올려야 할수도
  // 해당 파일이 고정적인지도 물어봐야 할듯
  async function manualMailer (sendemail, file) {
    const transporter = nodemailer.createTransport({
      service: SYSTEM_EMAIL_SERVICE,   // 메일 보내는 곳
      prot: SYSTEM_EMAIL_PORT,
      host: SYSTEM_EMAIL_HOST,  
      secure: false,  
      requireTLS: true,
      auth: {
        user: SYSTEM_EMAIL_USER,  // 보내는 메일의 주소
        pass: SYSTEM_EMAIL_APPPASS   // 보내는 메일의 비밀번호
      }
    });
    // 메일 옵션
    const mailOptions = {
      from: SYSTEM_EMAIL_USER, // 보내는 메일의 주소
      to: sendemail, // 수신할 이메일
      subject: title, // 메일 제목
      text: context // 메일 내용
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

export { sendMailer, manualMailer };




