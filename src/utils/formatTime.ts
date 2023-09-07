import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function formatRelativeTime(createdAt: dayjs.ConfigType) {
  const currentTime = dayjs();
  const timeDifference = currentTime.diff(createdAt, "hour");
  const relativeTimeString = dayjs(createdAt).fromNow(true);

  let formattedTime: string;

  if (timeDifference <= 24) {
    formattedTime = relativeTimeString
      .replace("seconds", "s")
      .replace("hours", "h")
      .replace("minutes", "m");
  } else {
    formattedTime = dayjs(createdAt).format("DD MMM");
  }

  return formattedTime;
}

export function formatCustomDateTime(dateTime: dayjs.ConfigType) {
  const postCreatedAt = dayjs(dateTime);
  const jam = postCreatedAt.hour();
  const menit = postCreatedAt.minute();
  const tanggal = postCreatedAt.date();
  const bulan = postCreatedAt.format("MMM");
  const tahun = postCreatedAt.year();
  const amPm = jam >= 12 ? "PM" : "AM";
  const jam12 = (jam % 12 || 12).toString().padStart(2, "0");
  const menitFormatted = menit.toString().padStart(2, "0");

  const formattedDate = `${jam12}.${menitFormatted} ${amPm} · ${tanggal} ${bulan} ${tahun}`;

  return formattedDate;
}
