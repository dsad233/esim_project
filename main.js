import express from "express";
import { sendMailer, manualMailer } from "./src/middleswares/mailerService.js";
import { swaggerUi, specs } from "./src/uilts/swaggerSetting.js";
import dotenv from "dotenv";
import qrcode from "qrcode";
import tesseract from "tesseract.js";
import jimp from "jimp";
import fs from "fs";
import axios from "axios";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.listen(port, () => {
    console.log(port, "포트로 서버가 구동 중 입니다.");
    console.log("스웨거 주소 : http://localhost:3000/api-docs");
});

// Swagger 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * tags:
 *   name: Send
 *   description: 유저 추가 수정 삭제 조회
 */


// 1. 해당 상품의 대한 정보 및 고객 정보 조회
app.get('/customer/fetory', async (req, res) => {
    try {

        // 필터링 필요
        return res.status(200).json({ message : "정보 조회 완료.", data : data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message : "정보 조회 오류 발생! 고객 센터에 문의 해주세요." });
    }
});

// 2. 받은 이메일로 메일 전송 -> 4번과 동일한 로직 느낌
app.post('/sendmail', async (req, res, next) => {
    try {
        const { customerEmail, file } = req.body;

        if(!customerEmail) {
            return res.status(400).json({ message : "고객의 이메일을 입력해 주세요." });
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
            return res.status(400).json({ message: "이메일 조건이 맞지 않습니다. 다시 입력해 주세요." });
        }

        // 다음 큐알코드와 설명서 (html)발송
        await sendMailer(customerEmail, file);
        return res.status(200).json({ message : "메일 전송 완료." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message : "메일 전송 오류 발생! 고객 센터에 문의 해주세요." });
    }
});


// 3. 관리자 메일에서 QR 코드 추출
app.post('/adminemail', async (req, res) => {
    try {
        const { adminEmail, imageUrl } = req.body;

        if(!adminEmail){
            return res.status(400).json({ message : "어드민 이메일 입력란을 입력해 주세요." });
        }

        if(!imageUrl){
            return res.status(400).json({ message : "Url란을 입력해 주세요." });
        }

        if (
            !adminEmail.includes("@naver.com") &&
            !adminEmail.includes("@daum.net") &&
            !adminEmail.includes("@google.com") &&
            !adminEmail.includes("@gmail.com") &&
            !adminEmail.includes("@googlemail.com") &&
            !adminEmail.includes("@hanmail.net") &&
            !adminEmail.includes("@icloud.com") &&
            !adminEmail.includes("@cyworld.com") &&
            !adminEmail.includes("@kakao.com") &&
            !adminEmail.includes("@mail.com") &&
            !adminEmail.includes("@narasarang.or.kr") &&
            !adminEmail.includes("@tistory.com")
        ) {
            return res.status(400).json({ message: "이메일 조건이 맞지 않습니다. 다시 입력해 주세요." });
        }

        if(adminEmail !== process.env.adminEmail){
            return res.status(403).json({ message : "관리자 메일이 일치하지 않습니다. 다시 입력해 주세요." });
        }

        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        const imagePath = './downloaded_image.jpg';
        const processedImagePath = './processed_image.jpg';

        // 다운로드한 이미지를 로컬 파일로 저장
        fs.writeFileSync(imagePath, buffer);

        // 이미지 전처리 (grayscale, increase contrast, resize)
        console.log("Processing image...");
        const image = await jimp.read(imagePath);
        await image
          .resize(800, jimp.AUTO) // 이미지 크기 조정
          .greyscale() // 그레이스케일로 변환
          .contrast(0.5) // 대비 증가
          .brightness(0.1) // 밝기 증가
          .writeAsync(processedImagePath);

        // OCR로 텍스트 추출
        console.log("Extracting text with Tesseract...");
        const { data: { text } } = await tesseract.recognize(
          processedImagePath,
          'kor+eng', // 한글과 영어 인식
          {
            logger: m => console.log(m)
          }
        );
        let jsonChange;
        try {
            jsonChange = JSON.parse(text); // JSON 형식일 경우 변환
        } catch (e) {
            jsonChange = text; // JSON이 아니면 원본 텍스트 반환
        }
        
        return res.status(200).json({ message : "QR코드 해석 완료.", data : jsonChange });
    } catch (err){
        console.error(err);
        return res.status(500).json({ message : "QR 코드 해석 오류 발생! 고객 센터에 문의 해주세요." });
    }
});


// file Url로 변경할 것인가? -> S3를 이용한 S3 링크 전송
// QR 코드 전송을 어떤 것으로 할 것 인가?
// 4. 고객에게 해당 상품에 대한 QR코드 + 사용 설명서 (첨부) 발송 // 네이버 알림톡도!!
app.post('/manualsend', async (req, res, next) => {
    try {
        const { customerEmail, imageurl, file } = req.body;

        if(!customerEmail){
            return res.status(400).json({ message : "고객 이메일란을 입력해 주세요." });
        }

        if(!imageurl){
            return res.status(400).json({ message : "Url란을 입력해 주세요." });
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
            return res.status(400).json({ message: "이메일 조건이 맞지 않습니다. 다시 입력해 주세요." });
        }

        // qrcode.toDataURL(url, (err, url) => {
        //     if(err){
        //         console.error(err);
        //         return res.status(500).json({ message : "QR코드 생성 오류 발생!" });  
        //     } else {
        //         const data = url.replace(/.*,/, "");
        //         const img = new Buffer.from(data, "base64");
            
        //          res.writeHead(200, {
        //           "Content-Type": "image/png",
        //           "Content-Length": img.length
        //         }); 
            
        //         res.end(img);
        //     }
        // });
        

        // 큐알 코드 생성 후 메일로 큐알 코드, 설명서 전송(양식), 카카오톡 알림톡, 네이버 알림톡 전송 (aws ses 봐야함)

        await manualMailer(customerEmail, file);
        return res.status(200).json({ message : "메일 전송 완료." });
    } catch (err){
        console.error(err);
        return res.status(500).json({ message : "QR 코드 생성 및 메뉴얼 발송 오류 발생! 고객 센터에 문의 해주세요." });
    }
});