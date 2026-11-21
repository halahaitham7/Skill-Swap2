// Drawn motifs that give every skill category its own visual language.
// Built from simple shapes in Deep Teal on a Mint or Butter tint.

function Photography() {
  return (
    <>
      <span className="ca-corner tl" />
      <span className="ca-corner tr" />
      <span className="ca-corner bl" />
      <span className="ca-corner br" />
      <span className="ca-aperture" />
      <span className="ca-caption">f/2.8 · 1/125 · ISO 200</span>
    </>
  );
}

function Languages() {
  return (
    <span className="ca-glyphs">
      <span>Aa</span>
      <span>あ</span>
      <span>ع</span>
      <span className="it">ñ</span>
    </span>
  );
}

function Programming() {
  return (
    <span className="ca-code">
      <span>
        <i>01</i> swap(you, me) {'{'}
      </span>
      <span>
        <i>02</i>&nbsp;&nbsp;return learn();
      </span>
      <span>
        <i>03</i> {'}'}
        <b className="ca-cursor" />
      </span>
    </span>
  );
}

function Design() {
  return (
    <>
      <span className="ca-circle" />
      <span className="ca-square" />
      <span className="ca-handle-line" />
      <span className="ca-handle a" />
      <span className="ca-handle b" />
    </>
  );
}

function Music() {
  return (
    <>
      <span className="ca-staff">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="ca-note n1" />
      <span className="ca-stem s1" />
      <span className="ca-note n2" />
      <span className="ca-stem s2" />
      <span className="ca-beam" />
    </>
  );
}

function Cooking() {
  return (
    <span className="ca-recipe">
      <span className="ca-plate">
        <span />
      </span>
      <span className="ca-list">
        <span>2 cups flour</span>
        <span>1 tsp salt</span>
        <span>350 ml water</span>
      </span>
    </span>
  );
}

function Marketing() {
  return (
    <span className="ca-bars">
      <i style={{ height: '24%' }} />
      <i style={{ height: '44%' }} />
      <i style={{ height: '66%' }} />
      <i className="open" style={{ height: '88%' }} />
      <b>+38%</b>
    </span>
  );
}

function Video() {
  return (
    <span className="ca-film">
      <span className="ca-sprockets" />
      <span className="ca-frames">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="ca-sprockets" />
      <span className="ca-caption right">00:01:24:08</span>
    </span>
  );
}

const MOTIFS = {
  photography: Photography,
  languages: Languages,
  programming: Programming,
  design: Design,
  music: Music,
  cooking: Cooking,
  marketing: Marketing,
  video: Video,
};

export default function CategoryArt({ motif, tint = 'mint', height = 150 }) {
  const Motif = MOTIFS[motif];
  return (
    <span className={`category-art tint-${tint} motif-${motif}`} style={{ height }} aria-hidden="true">
      {Motif && <Motif />}
    </span>
  );
}
