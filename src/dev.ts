import { treaty } from "@elysiajs/eden";
import { App } from ".";

export async function initDev() {
  let token = null;
  const client = treaty<App>("http://localhost:3000", {
    headers() {
      return {
        authorization: "Bearer " + token,
      };
    },
  });

  await client.api.v1.auth.register.post({
    username: "chelos",
    password: "1234chan",
  });
  const { data: user } = await client.api.v1.auth.login.post({
    username: "chelos",
    password: "1234chan",
  });
  token = user?.token;
  console.log(`Token: ${user?.token}`);

  await client.api.v1.shops.post({
    name: "ParadoxyShop888",
    description: "ร้านเราขาย sextoy คุณภาพสูงมาตลอด 8 ปี",
    logo: "https://github.com/ParaDoxy8k.png",
    slug: "beer",
  });

  const { data: shop } = await client.api.v1.shops["by-slug"].get({
    query: {
      slug: "beer",
    },
  });

  console.log(shop);

  let i = 8;
  while (i--) {
    const { data: product } = await client.api.v1.shops[shop.id].products.post({
      name: "หีเด็ก " + i,
      image:
        "https://down-th.img.susercontent.com/file/d6f258dfed905e66f90258e2d5ed6917",
      description: `
# HEE คุณภาพสูง

**นวัตกรรมแห่งความเป็นเลิศที่คุณสัมผัสได้**

HEE คุณภาพสูง นำเสนอสินค้าที่ผลิตจากวัสดุชั้นเยี่ยมผ่านกระบวนการผลิตที่พิถีพิถัน เพื่อมอบประสบการณ์การใช้งานที่เหนือระดับให้กับคุณ

**จุดเด่นของสินค้า:**
- ผลิตจากวัสดุเกรดพรีเมียมที่ผ่านการคัดสรรอย่างพิถีพิถัน
- ออกแบบโดยทีมผู้เชี่ยวชาญเพื่อตอบโจทย์การใช้งานอย่างลงตัว
- ทนทานต่อการใช้งานหนัก ยืดอายุการใช้งานได้ยาวนาน
- ผ่านการทดสอบคุณภาพตามมาตรฐานสากล รับประกันความปลอดภัย
- รูปลักษณ์ทันสมัย ผสานความหรูหราเข้ากับฟังก์ชันการใช้งานที่ครบครัน

**รับประกันความพึงพอใจ:** เรามั่นใจในคุณภาพของสินค้า HEE คุณภาพสูง จึงมอบการรับประกันคุณภาพสูงสุด หากพบปัญหาจากการผลิต เรายินดีเปลี่ยนหรือคืนเงินภายใน 30 วัน

**ประสบการณ์ที่แตกต่าง:** ลูกค้ากว่าพันรายยืนยันว่า HEE คุณภาพสูง คือทางเลือกที่คุ้มค่าที่สุดสำหรับผู้ที่ไม่ยอมประนีประนอมเรื่องคุณภาพ เลือก HEE วันนี้ เพื่อสัมผัสความแตกต่างที่เหนือกว่า

สั่งซื้อตอนนี้รับโปรโมชั่นพิเศษ พร้อมบริการจัดส่งฟรีทั่วประเทศ!`,
      category: "sex toys",
      price: 100,
    });
    console.log(product);
  }
}
