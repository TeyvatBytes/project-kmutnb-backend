import twVoucher from "@fortune-inc/tw-voucher";
const data = await twVoucher(
  "0971051957",
  "https://gift.truemoney.com/campaign/?v=01959453dd9978bf88da665fdd597e842fk",
);

console.log(data);

// {
//   amount: 10,
//   owner_full_name: "ณัฐเกียรติ ***",
//   code: "01959453dd9978bf88da665fdd597e842fk",
// }
