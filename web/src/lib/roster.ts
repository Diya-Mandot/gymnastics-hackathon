// The real 2027 Utah Red Rocks roster, shown with the athletes' permission.
// Source: https://utahutes.com/sports/womens-gymnastics/roster (fetched Nov 2026). Headshots are the
// official Utah Athletics roster photos, saved in /public/images/athletes.
// `featured` points at the athletes who also have a full campaign profile in seed.ts.

export type RosterAthlete = {
  slug: string;
  name: string;
  classYear: string;
  hometown: string;
  school: string;
  photo: string;
  /** One real highlight from her official bio */
  highlight: string;
  profileUrl: string;
  /** Slug of her campaign profile on this site, if she has one */
  featured?: string;
};

const UTES = "https://utahutes.com/sports/womens-gymnastics/roster";

export const roster: RosterAthlete[] = [
  { slug: "avery-neff", featured: "avery", name: "Avery Neff", classYear: "Junior", hometown: "South Jordan, Utah", school: "Bingham High School", highlight: "2026 Big 12 Gymnast of the Year · 11x All-American", profileUrl: `${UTES}/avery-neff/18033` },
  { slug: "camie-winger", featured: "camie", name: "Camie Winger", classYear: "Senior", hometown: "Orem, Utah", school: "Timpanogos High School", highlight: "2026 Big 12 beam champion", profileUrl: `${UTES}/camie-winger/18049` },
  { slug: "clara-raposo", featured: "clara", name: "Clara Raposo", classYear: "Junior", hometown: "Toronto, Canada", school: "Mississauga Secondary School", highlight: "Five-time Canadian National Team member", profileUrl: `${UTES}/clara-raposo/18045` },
  { slug: "ella-zirbes", featured: "ella", name: "Ella Zirbes", classYear: "Senior", hometown: "Stillwater, Minnesota", school: "Stillwater Area High School", highlight: "7x All-American · 20 career wins", profileUrl: `${UTES}/ella-zirbes/18028` },
  { slug: "elizabeth-gantner", name: "Elizabeth Gantner", classYear: "Senior", hometown: "Indianapolis, Indiana", school: "Roncalli High School", highlight: "Led off beam in all 14 meets in 2026", profileUrl: `${UTES}/elizabeth-gantner/18042` },
  { slug: "zoe-johnson", name: "Zoe Johnson", classYear: "Junior", hometown: "Durham, North Carolina", school: "Eno River Academy", highlight: "Career-high 9.95 on vault", profileUrl: `${UTES}/zoe-johnson/18021` },
  { slug: "poppy-grace-stickler", name: "Poppy-Grace Stickler", classYear: "Junior", hometown: "Cardiff, Wales", school: "Whitchurch High School", highlight: "British team, 2022 World Championships silver", profileUrl: `${UTES}/poppygrace-stickler/18047` },
  { slug: "sage-curtis", name: "Sage Curtis", classYear: "Sophomore", hometown: "Riverton, Utah", school: "Riverton High School", highlight: "Big 12 Newcomer of the Week · 9.95 on floor", profileUrl: `${UTES}/sage-curtis/18030` },
  { slug: "abbi-ryssman", name: "Abbi Ryssman", classYear: "Sophomore", hometown: "Rochester, Minnesota", school: "Rochester Century High School", highlight: "2026 Big 12 All-Freshman Team", profileUrl: `${UTES}/abbi-ryssman/18024` },
  { slug: "bailey-stroud", name: "Bailey Stroud", classYear: "Sophomore", hometown: "New Palestine, Indiana", school: "Greenfield Central High School", highlight: "Career-high 9.925 on bars", profileUrl: `${UTES}/bailey-stroud/18037` },
  { slug: "norah-christian", name: "Norah Christian", classYear: "Sophomore", hometown: "Bremerton, Washington", school: "Washington Connection Academy", highlight: "2024 Vegas Cup all-around champion", profileUrl: `${UTES}/norah-christian/18040` },
  { slug: "lilly-tubbs", name: "Lilly Tubbs", classYear: "Graduate student", hometown: "Pflugerville, Texas", school: "Transferred from Washington", highlight: "All-Big Ten Second Team (2026)", profileUrl: `${UTES}/lilly-tubbs/18054` },
  { slug: "arielle-ward", name: "Arielle Ward", classYear: "Graduate student", hometown: "Frisco, Texas", school: "Transferred from Illinois", highlight: "Career-high 9.95 on vault · Academic All-Big Ten", profileUrl: `${UTES}/arielle-ward/18053` },
  { slug: "leonie-gervais", name: "Léonie Gervais", classYear: "Freshman", hometown: "Trois-Rivières, Quebec", school: "Académie les Estacades", highlight: "2026 Elite Canada vault silver medalist", profileUrl: `${UTES}/lonie-gervais/18052` },
  { slug: "ayla-miller", name: "Ayla Miller", classYear: "Freshman", hometown: "Big Lake, Minnesota", school: "Big Lake High School", highlight: "2025 Northern Lights Classic all-around champion", profileUrl: `${UTES}/ayla-miller/18051` },
].map((a) => ({ ...a, photo: `/images/athletes/${a.slug}.jpg` }));

export const rosterBySlug = (slug: string) => roster.find((a) => a.slug === slug);
