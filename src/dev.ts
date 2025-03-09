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
      name: "สินค้า " + i,
      image:
        "https://down-th.img.susercontent.com/file/d6f258dfed905e66f90258e2d5ed6917",
      description: `# เกราะเวทย์มังกรทองคำ

เสริมพลังการต่อสู้ของคุณด้วยเกราะเวทย์มังกรทองคำอันทรงพลัง! ชุดเกราะตำนานที่หลอมรวมจากเกล็ดมังกรทองคำโบราณและเวทมนตร์แห่งธาตุไฟ

## คุณสมบัติพิเศษ:
• เพิ่มความต้านทานธาตุไฟ 75%
• ฟื้นฟูพลังชีวิต 5% ทุก 10 วินาที
• ลดความเสียหายจากศัตรูระดับบอส 15%
• มีโอกาส 10% ในการสะท้อนความเสียหายกลับไปยังผู้โจมตี

สวมใส่ชุดครบเซ็ตเพื่อปลดล็อกพลังพิเศษ "ลมหายใจมังกร" - สร้างความเสียหายธาตุไฟรอบตัวทุก 30 วินาที!

เกราะนี้หาได้เฉพาะในกิจกรรมล่ามังกรทองคำซึ่งจัดขึ้นเพียงปีละครั้งเท่านั้น อย่าพลาดโอกาสครอบครองไอเทมระดับตำนานที่จะทำให้ศัตรูต้องหวั่นไหว!

*ไอเทมนี้ไม่สามารถซื้อขายในตลาดได้ และจะผูกติดกับตัวละครเมื่อสวมใส่*`,
      category: "รหัส",
      price: 100,
    });
    console.log(product);
  }
}
