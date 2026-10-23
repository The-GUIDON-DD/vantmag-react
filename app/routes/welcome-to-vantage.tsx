import type { Route } from "./+types/welcome-to-vantage";
import "./../about.css"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About-Vantage Magazine" },
    { name: "description", content: "Vantage Magazine" },
  ];
}

const categories = [
  {  slug: "tv-and-film", label: "TV & Film", color: "var(--tv-film)"},
  {  slug: "food", label: "Food", color: "var(--food)"},
  {  slug: "theater-and-the-arts", label: "Theater & Arts", color: "var(--theater-arts)"},
  {  slug: "music", label: "Music", color: "var(--music)"},
  {  slug: "hype", label: "Hype", color: "var(--hype)"},
  {  slug: "hub", label: "Hub", color: "var(--hub)"},
  {  slug: "expose", label: "Expose", color: "var(--expose)"},
];

const photos = [
    { no: "01", color: "var(--food)"},
    { no: "02", color: "var(--hub)"},
    { no: "03", color: "var(--theater-arts)"},
    { no: "04", color: "var(--expose)"},
    { no: "05", color: "var(--hype)"},
];

export default function WelcomeToVantage() {
  return (
    <main id="about">
      <h2 className="mobile-hero"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40)), url('https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/about/00.jpg')",
        }}>
             We are The GUIDON's online magazine, a publication geared towards{" "}
          <span className="highlight">
            campus culture
          </span>{" "}
          and the people who{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            make it.
          </span>
     </h2>  
      <div className="general-container">
        <h3 className="text-[1.17em] font-bold my-4">
            We are The GUIDON's online magazine, a publication geared towards{" "}
          <span className="highlight">
            campus culture
          </span>{" "}
          and the people who{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            make it.
          </span>
        </h3>
        <hr/>
        <div className="desc-chips-container">
            <div className="writeup">
                <p className="wp-block-paragraph">
                In line with the massive potential of the online medium, our mission is to 
                take student journalism into the 21st century. From documentaries to interactive quizzes, 
                to story submissions from the readers themselves, 

            <strong> this magazine is a step away from pretense and towards accessibility</strong>
                
                . It’s a place to share stories and to join in on discussions—a place for people to engage with the publication.
            </p>
            <p className="wp-block-paragraph">
                For the past 95 years, The GUIDON has established itself as a {" "}

                <strong>
                    voice of the students, promising a platform for your stories
                     and your opinions to be heard
                </strong>

                . For everything from food to film, we are that platform.
            </p>

            <p className="wp-block-paragraph">
                This is for the musicians. This is for the foodies. This is for the neophytes, the aficionados and all the in-betweens. This is for the storytellers. This is for you.
            </p>

            <p className="wp-block-paragraph">
                Welcome to the homepage of the Atenean. 
                <br/>
                Welcome to Vantage.
            </p>
            
            <hr/>
            
            <p className="wp-block-paragraph">
                <strong>Editors</strong>
                <br/>
                Audrey Ruiz
                <br/>
                Madi Castro
                <br/>
            </p>
            </div>
            <div className="categories">
                {categories.map((c) => (
                    <a key={c.slug}
                    className="chip"
                    style={{ "--bg-color": c.color } as React.CSSProperties}
                    href={`https://vantage.theguidon.com/category/${c.slug}/`}
                    > 
                    <img src={`https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/icons/chip/${c.slug}.png`}></img>
                    {c.label} </a>
                ))}

            </div>
        </div>
        
      </div>
      <div className="photos-container">
            {photos.map((p) => (
                <img
                key={p.no}
                src={`https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/about/${p.no}.jpg`}
                alt={`Vantage photo ${p.no}`}
                />
            ))}
            {photos.map((p) => (
                <div
                key={`bg-${p.no}`}
                style={{ "--bg-color": p.color } as React.CSSProperties}
                ></div>
            ))}
            
        </div>
    </main>
  );
}
