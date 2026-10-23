import type { CSSProperties } from "react";
import Chip from "~/components/chip";
import { categories } from "../../constants";
import type { Route } from "./+types/welcome-to-vantage";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "About-Vantage Magazine" },
    { name: "description", content: "Vantage Magazine" },
  ];
}

const photos = [
  {
    no: "01",
    color: categories.food.color,
    area: "[grid-area:p1]",
    flat: "rounded-1-none",
  },
  {
    no: "02",
    color: categories.hub.color,
    area: "[grid-area:p2]",
    flat: "rounded-1-none",
  },
  {
    no: "03",
    color: categories["theater-and-the-arts"].color,
    area: "[grid-area:p3]",
  },
  {
    no: "04",
    color: categories.expose.color,
    area: "[grid-area:p4]",
    flat: "rounded-r-none",
  },
  {
    no: "05",
    color: categories.hype.color,
    area: "[grid-area:p5]",
    flat: "rounded-r-none",
  },
];

export default function WelcomeToVantage() {
  return (
    <main
      id="about"
      className="bg-[rgba(221,223,254,0.80)] py-16 max-[576px]:pb-16 max-[576px]:py-0"
    >
      <h2
        className="hidden max-[576px]:block bg-cover bg-center p-8 font-display text-[32px] font-bold text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/about/00.jpg')`,
        }}
      >
        We are The GUIDON's online magazine, a publication geared towards{" "}
        <span className="bg-vant-purple">campus culture</span> and the people
        who <span className="whitespace-nowrap">make it.</span>
      </h2>
      <div className="max-auto my-0 w-full max-w-360 px-30 py-0 mb-16 max-[576px]:px-4 max-[576px]:mt-5 max-[576px]:mb-10">
        <h3 className="font-display text-5xl font-bold max-[576px]:hidden">
          We are The GUIDON's online magazine, a publication geared towards{" "}
          <span className="bg-[#C9CBFF]">campus culture</span> and the people
          who <span className="whitespace-nowrap">make it.</span>
        </h3>
        <hr className="mx-0 my-6 border border-neutral-500 max-[576px]:hidden" />
        <div className="grid grid-cols-[3fr_1fr] gap-x-16 gap-y-6 max-md:grid-cols-1">
          <div>
            <p className="text-xl leading-[1.4] not-last:mb-8">
              In line with the massive potential of the online medium, our
              mission is to take student journalism into the 21st century. From
              documentaries to interactive quizzes, to story submissions from
              the readers themselves,
              <strong>
                {" "}
                this magazine is a step away from pretense and towards
                accessibility
              </strong>
              . It’s a place to share stories and to join in on discussions—a
              place for people to engage with the publication.
            </p>
            <p className="text-xl leading-[1.4] not-last:mb-8">
              For the past 97 years, The GUIDON has established itself as a{" "}
              <strong>
                voice of the students, promising a platform for your stories and
                your opinions to be heard
              </strong>
              . For everything from food to film, we are that platform.
            </p>

            <p className="text-xl leading-[1.4] not-last:mb-8">
              This is for the musicians. This is for the foodies. This is for
              the neophytes, the aficionados and all the in-betweens. This is
              for the storytellers. This is for you.
            </p>

            <p className="text-xl leading-[1.4] not-last:mb-8">
              Welcome to the homepage of the Atenean.
              <br />
              Welcome to Vantage.
            </p>

            <hr className="mx-0 my-6 border border-neutral-500" />

            <p className="text-xl leading-[1.4] not-last:mb-8">
              <strong>Editors</strong>
              <br />
              Audrey Ruiz
              <br />
              Madi Castro
              <br />
            </p>
          </div>
          <div className="flex flex-row flex-wrap content-start justify-end gap-3 max-[576px]:hidden">
            {Object.entries(categories)
              .filter(([, c]) => !c.hiddenFromNavigation)
              .map(([slug, c]) => (
                <a
                  key={slug}
                  href={`https://vantage.theguidon.com/category/${slug}/`}
                >
                  <Chip icon={c.icon} color={c.color} title={c.title} />
                </a>
              ))}
          </div>
        </div>
      </div>
      <div
        className="size-full rounded-sm grid h-150 grid-cols-[1fr_2fr_1fr] grid-rows-[1fr_1fr] gap-8 overflow-x-clip
      [grid-template-areas:'p1_p3_p4'_'p2_p3_p5']
      max-[576px]:h-[unset] max-[576px]:grid-cols-2 max-[576px]:grid-rows-[1fr_2fr_1fr] max-[576px]:gap-3 max-[576px]:px-4
      max-[576px]:[grid-template-areas:'p1_p2'_'p3_p3'_'p4_p5']"
      >
        {photos.map((p) => (
          <img
            key={p.no}
            src={`https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/about/${p.no}.jpg`}
            alt={`Vantage ${p.no}`}
            className={`relative z-[1] size-full rounded-sm object-cover ${p.area} ${p.flat}`}
          />
        ))}
        {photos.map((p) => (
          <div
            key={`bg-${p.no}`}
            style={{ "--bg-color": p.color } as CSSProperties}
            className={`size-full rounded-sm translate-4 bg-[var(--bg-color,_var(--color-vant-purple))] ${p.area} ${p.flat} max-[576px]:hidden`}
          ></div>
        ))}
      </div>
    </main>
  );
}
