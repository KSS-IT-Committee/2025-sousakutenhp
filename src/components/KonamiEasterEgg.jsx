import { useEffect, useState } from "react";

export default function KonamiEasterEgg() {
  const [active, setActive] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

  useEffect(() => {
    // 画面リサイズを監視してwidth更新
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const konami = [
      "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
      "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
      "b","a"
    ];
    let input = [];
    let idCounter = 0;

    const onKeyDown = (e) => {
      input.push(e.key);
      if (input.length > konami.length) input.shift();

      if (input.join(",").toLowerCase() === konami.join(",").toLowerCase()) {
        const newId = idCounter++;
        const newBottom = Math.floor(Math.random() * 250) + 50;

        setActive((prev) => [...prev, { id: newId, bottom: newBottom }]);

        // アニメーション時間を画面幅に比例（例：1000pxで4秒）
        const animDuration = Math.max(2, (windowWidth / 1000) * 4); // 最低2秒、最大は画面幅に比例

        setTimeout(() => {
          setActive((prev) => prev.filter((item) => item.id !== newId));
        }, animDuration * 1000);

        input = [];
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [windowWidth]);

  // アニメーション時間の計算（再レンダリング時にも使う）
  const animationDuration = Math.max(2, (windowWidth / 1000) * 4); // 2秒〜（例）

  return (
    <>
      {active.map(({ id, bottom }) => (
        <img
          key={id}
          src="/img/koisshi.png"
          style={{
            position: "fixed",
            bottom: `${bottom}px`,
            right: "-150px",
            width: "100px",
            height: "100px",
            animation: `roll-left ${animationDuration}s linear forwards`,
            zIndex: 9999,
          }}
        />
      ))}

      <style>{`
        @keyframes roll-left {
          0% {
            right: -150px;
            transform: rotate(0deg);
          }
          100% {
            right: 100vw;
            transform: rotate(-1080deg);
          }
        }
      `}</style>
    </>
  );
}
