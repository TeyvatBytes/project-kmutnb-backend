import { treaty } from "@elysiajs/eden";
import { App } from ".";
export async function initDemo() {
  let token = null;
  const client = treaty<App>("http://localhost:3000", {
    headers() {
      return {
        authorization: "Bearer " + token,
      };
    },
  });

  await client.api.v1.auth.register.post({
    username: "demo_user",
    password: "!1234567demo",
  });

  const { data: user } = await client.api.v1.auth.login.post({
    username: "demo_user",
    password: "!1234567demo",
  });
  token = user?.token;
  console.log(`Token: ${user?.token}`);

  await client.api.v1.shops.post({
    name: "EpicGameLoot",
    description:
      "ร้านขายไอเทมเกมคุณภาพ การันตีของแท้ สินค้าหลากหลาย บริการดีตลอด 8 ปี",
    logo: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/video-games/epic-games-hg3aynrgcuetqn170db1g9.png/epic-games-y5xqpgrdx4l1nft47f5gz7.png?_a=DAJFJtWIZAAC",
    slug: "demo",
  });

  const { data: shop } = await client.api.v1.shops["by-slug"].get({
    query: {
      slug: "demo",
    },
  });
  console.log(shop);

  // Game items array
  const gameItems = [
    {
      name: "เกราะเวทย์มังกรทองคำ",
      image: "https://files.catbox.moe/292zn2.jpg",
      description: `# เกราะเวทย์มังกรทองคำ
      เสริมพลังการต่อสู้ของคุณด้วยเกราะเวทย์มังกรทองคำอันทรงพลัง! ชุดเกราะตำนานที่หลอมรวมจากเกล็ดมังกรทองคำโบราณและเวทมนตร์แห่งธาตุไฟ
      ## คุณสมบัติพิเศษ:
      • เพิ่มความต้านทานธาตุไฟ 75%
      • ฟื้นฟูพลังชีวิต 5% ทุก 10 วินาที
      • ลดความเสียหายจากศัตรูระดับบอส 15%
      • มีโอกาส 10% ในการสะท้อนความเสียหายกลับไปยังผู้โจมตี
      สวมใส่ชุดครบเซ็ตเพื่อปลดล็อกพลังพิเศษ "ลมหายใจมังกร" - สร้างความเสียหายธาตุไฟรอบตัวทุก 30 วินาที!
      *ไอเทมนี้ผูกติดกับตัวละครเมื่อสวมใส่*`,
      category: "เกราะ",
      price: 1200,
    },
    {
      name: "ดาบแห่งแสงสว่าง",
      image: "https://files.catbox.moe/77hvz9.jpg",
      description: `# ดาบแห่งแสงสว่าง
  อาวุธตำนานที่หลอมด้วยแสงของดวงดาวโบราณ พร้อมนำพาผู้ถือครองสู่ชัยชนะ
  ## คุณสมบัติพิเศษ:
  • เพิ่มความเสียหาย 120 หน่วย
  • มีโอกาส 15% ในการสร้างความเสียหายแสงเพิ่มเติม
  • เพิ่มความเร็วในการโจมตี 8%
  • สร้างออร่าแสงสว่างช่วยเพิ่มพลังให้กับเพื่อนร่วมทีม
  *ดาบที่สามารถอัพเกรดได้เมื่อสังหารมอนสเตอร์ครบ 1,000 ตัว*`,
      category: "อาวุธ",
      price: 980,
    },
    {
      name: "น้ำยาฟื้นฟูพลัง (แพ็ค 10 ขวด)",
      image: "https://files.catbox.moe/052g1m.jpeg",
      description: `# น้ำยาฟื้นฟูพลัง (แพ็ค 10 ขวด)
  เติมพลังให้กับการผจญภัยของคุณด้วยน้ำยาฟื้นฟูพลังคุณภาพสูง
  ## คุณสมบัติ:
  • ฟื้นฟูพลังชีวิต 50% ทันที
  • เพิ่มความต้านทานพิษ 30% เป็นเวลา 5 นาที
  • ลดเวลาคูลดาวน์สกิล 10% เป็นเวลา 3 นาที
  *แพ็คพิเศษ 10 ขวด ประหยัดกว่าซื้อแยก 15%*`,
      category: "ยา",
      price: 350,
    },
    {
      name: "สัตว์เลี้ยงเอลฟ์จิ๋ว",
      image: "https://files.catbox.moe/42vew9.jpg",
      description: `# สัตว์เลี้ยงเอลฟ์จิ๋ว
  พันธมิตรตัวน้อยที่จะติดตามและช่วยเหลือคุณในการผจญภัย
  ## คุณสมบัติพิเศษ:
  • เก็บไอเทมอัตโนมัติในรัศมี 5 เมตร
  • เพิ่มโอกาสดรอปไอเทมหายาก 5%
  • มีทักษะรักษา ฟื้นฟูพลังชีวิตให้ผู้เล่น 10 หน่วยทุก 1 นาที
  • สามารถส่งออกไปซื้อของในเมืองได้
  *สัตว์เลี้ยงตัวนี้ต้องการอาหารพิเศษทุก 3 วัน*`,
      category: "สัตว์เลี้ยง",
      price: 800,
    },
    {
      name: "แพ็คสกินตัวละครพรีเมียม",
      image: "https://files.catbox.moe/dp3ydl.jpg",
      description: `# แพ็คสกินตัวละครพรีเมียม
  เปลี่ยนลุคให้ตัวละครของคุณด้วยชุดสกินสุดพิเศษจากซีซั่นที่ 5
  ## รายละเอียด:
  • สกินชุดอัศวินมังกร
  • สกินชุดนินจาเงา
  • สกินชุดนักรบเวทย์จักรวาล
  • เอฟเฟกต์พิเศษเมื่อใช้สกิลอัลติเมท
  • เสียงพิเศษเฉพาะชุด
  *แพ็คนี้มีจำหน่ายในช่วงเวลาจำกัดเท่านั้น*`,
      category: "สกิน",
      price: 1500,
    },
    {
      name: "รหัสเกม The Last Fantasy Online",
      image:
        "https://www.ggkeystore.com/cdn-cgi/image/fit=scale-down,w=1920,q=85,f=auto,anim=false,sharpen=0,onerror=redirect,metadata=none/storage/articles/ZAdhoNtVIk0c5cHQagPgPKGvfOPYOKKJ1n4Hax4y.jpeg?1666450944",
      description: `# รหัสเกม The Last Fantasy Online
  รหัสเกมเวอร์ชันเต็มพร้อมส่วนเสริมพิเศษ
  ## สิ่งที่คุณจะได้รับ:
  • เกมเวอร์ชันเต็มพร้อมเล่นทันที
  • ส่วนเสริม "ดินแดนแห่งมนตรา"
  • ตัวละครพิเศษ "นักดาบแห่งแสง"
  • 500 เหรียญเกมสำหรับซื้อไอเทมในร้านค้า
  • สิทธิ์เข้าร่วมกิจกรรมพิเศษ 1 ปี
  *รหัสเกมสามารถใช้ได้บนทุกแพลตฟอร์ม*`,
      category: "รหัสเกม",
      price: 1800,
    },
    {
      name: "กล่องสุ่มไอเทมตำนาน",
      image: "https://files.catbox.moe/u18yv4.jpg",
      description: `# กล่องสุ่มไอเทมตำนาน
  ลุ้นรับไอเทมระดับตำนานที่หาได้ยากจากกล่องสุ่มสุดพิเศษ
  ## โอกาสในการได้รับไอเทม:
  • ไอเทมตำนาน: 5%
  • ไอเทมหายาก: 15%
  • ไอเทมพิเศษ: 30%
  • ไอเทมธรรมดา: 50%
  ## รายการไอเทมตำนานที่มีโอกาสได้รับ:
  • ชุดเกราะเทพเจ้าสงคราม
  • อาวุธผู้พิชิตมังกร
  • สัตว์เลี้ยงฟีนิกซ์เพลิง
  • จี้แห่งการฟื้นคืนชีพ
  *การันตีได้ไอเทมตำนานเมื่อเปิดครบ 50 กล่อง*`,
      category: "กล่องสุ่ม",
      price: 499,
    },
    {
      name: "บัตรเพิ่มประสบการณ์ 200%",
      image: "https://files.catbox.moe/0xs9pc.jpeg",
      description: `# บัตรเพิ่มประสบการณ์ 200%
          เร่งการเลเวลอัพของคุณด้วยบัตรบูสต์ประสบการณ์สุดคุ้ม
          ## รายละเอียด:
          • เพิ่มค่าประสบการณ์ 200% เป็นเวลา 48 ชั่วโมง
          • เพิ่มโอกาสดรอปไอเทม 50% ในช่วงเวลาที่ใช้งาน
          • สามารถใช้ร่วมกับกิจกรรมดับเบิลเอ็กซ์พีได้
          • ใช้ได้กับทุกโหมดการเล่น ทั้ง PvE และ PvP
          *บัตรจะเริ่มใช้งานทันทีเมื่อเปิดใช้ และนับเวลาต่อเนื่องแม้ออฟไลน์*`,
      category: "บูสเตอร์",
      price: 250,
    },
  ];

  // Add each game item to the shop
  for (let i = 0; i < gameItems.length; i++) {
    const item = gameItems[i];
    const { data: product } = await client.api.v1.shops[shop.id].products.post({
      name: item.name,
      image: item.image,
      description: item.description,
      category: item.category,
      price: item.price,
    });
    console.log(`Added product: ${product.name}`);
  }
}
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
    password: "chelosno1",
  });
  const { data: user } = await client.api.v1.auth.login.post({
    username: "chelos",
    password: "chelosno1",
  });
  token = user?.token;
  console.log(`Token: ${user?.token}`);

  await client.api.v1.shops.post({
    name: "ParadoxyShop888",
    description: "ร้านเราขายเกมคุณภาพสูงมาตลอด 8 ปี",
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
