import { useEffect, useState } from "react";

export default function KonamiEasterEgg() {
  const [active, setActive] = useState([]);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000
  );

  useEffect(() => {
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
        const animDuration = Math.max(2, (windowWidth / 1000) * 4);

        // 初期位置は -150px
        setActive((prev) => [
          ...prev,
          { id: newId, bottom: newBottom, right: -150, moving: false }
        ]);

        // 次のフレームで移動開始
        setTimeout(() => {
          setActive((prev) =>
            prev.map((item) =>
              item.id === newId ? { ...item, moving: true } : item
            )
          );
        }, 50);

        setTimeout(() => {
          setActive((prev) => prev.filter((item) => item.id !== newId));
        }, animDuration * 1000);

        input = [];
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [windowWidth]);

  const animationDuration = Math.max(2, (windowWidth / 1000) * 4);

  const handleSplit = (id, bottom, right) => {
    const newId1 = Date.now() + Math.random();
    const newId2 = Date.now() + Math.random() + 1;
    

    setActive((prev) => {
      const withoutClicked = prev.filter((item) => item.id !== id);
      return [
        ...withoutClicked,
        { id: newId1, bottom: bottom + 30, right, moving: false },
        { id: newId2, bottom: bottom - 30, right, moving: false }
      ];
    });

    // 次のフレームで2匹を移動開始
    setTimeout(() => {
      setActive((prev) =>
        prev.map((item) =>
          item.id === newId1 || item.id === newId2
            ? { ...item, moving: true }
            : item
        )
      );
    }, 50);

    setTimeout(() => {
      setActive((prev) =>
        prev.filter((item) => item.id !== newId1 && item.id !== newId2)
      );
    }, animationDuration * 1000);
  };

  return (
    <>
      {active.map(({ id, bottom, right, moving }) => (
        <img
          key={id}
          src="/img/koisshi.png"
          style={{
            position: "fixed",
            bottom: `${bottom}px`,
            right: moving ? "100vw" : `${right}px`,
            width: "100px",
            height: "100px",
            zIndex: 9999,
            cursor: "pointer",
            transform: moving ? "rotate(-1080deg)" : "rotate(0deg)",
            transition: `right ${animationDuration}s linear, transform ${animationDuration}s linear`
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRight = window.innerWidth - rect.right;
            handleSplit(id, bottom, clickRight);
          }}
        />
      ))}
    </>
  );
}


// import { useEffect, useState } from "react";

// export default function KonamiEasterEgg() {
//   const [active, setActive] = useState([]);
//   const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

//   useEffect(() => {
//     const onResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   useEffect(() => {
//     const konami = [
//       "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
//       "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
//       "b","a"
//     ];
//     let input = [];
//     let idCounter = 0;

//     const onKeyDown = (e) => {
//       input.push(e.key);
//       if (input.length > konami.length) input.shift();

//       if (input.join(",").toLowerCase() === konami.join(",").toLowerCase()) {
//         const newId = idCounter++;
//         const newBottom = Math.floor(Math.random() * 250) + 50;
//         const animDuration = Math.max(2, (windowWidth / 1000) * 4);

//         setActive((prev) => [...prev, { id: newId, bottom: newBottom }]);

//         setTimeout(() => {
//           setActive((prev) => prev.filter((item) => item.id !== newId));
//         }, animDuration * 1000);

//         input = [];
//       }
//     };

//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [windowWidth]);

//   const animationDuration = Math.max(2, (windowWidth / 1000) * 4);

//   const handleSplit = (id, bottom) => {
//     setActive((prev) => {
//       // 元画像を削除
//       const withoutClicked = prev.filter((item) => item.id !== id);
//       // 新IDを割り当て
//       const newItems = [
//         { id: Date.now() + Math.random(), bottom: bottom + 15 },
//         { id: Date.now() + Math.random() + 1, bottom: bottom - 15 },
//       ];
//       return [...withoutClicked, ...newItems];
//     });

//     // 分裂後も一定時間で消える処理
//     const animDuration = animationDuration;
//     setTimeout(() => {
//       setActive((prev) =>
//         prev.filter((item) => item.bottom !== bottom + 15 && item.bottom !== bottom - 15)
//       );
//     }, animDuration * 1000);
//   };

//   return (
//     <>
//       {active.map(({ id, bottom }) => (
//         <img
//           key={id}
//           src="/img/koisshi.png"
//           style={{
//             position: "fixed",
//             bottom: `${bottom}px`,
//             right: "-150px",
//             width: "100px",
//             height: "100px",
//             animation: `roll-left ${animationDuration}s linear forwards`,
//             zIndex: 9999,
//             cursor: "pointer",
//           }}
//           onClick={() => handleSplit(id, bottom)}
//         />
//       ))}

//       <style>{`
//         @keyframes roll-left {
//           0% {
//             right: -150px;
//             transform: rotate(0deg);
//           }
//           100% {
//             right: 100vw;
//             transform: rotate(-1080deg);
//           }
//         }
//       `}</style>
//     </>
//   );
// }

// // import { useEffect, useState } from "react";

// // export default function KonamiEasterEgg() {
// //   const [active, setActive] = useState([]);
// //   const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

// //   useEffect(() => {
// //     // 画面リサイズを監視してwidth更新
// //     const onResize = () => setWindowWidth(window.innerWidth);
// //     window.addEventListener("resize", onResize);

// //     return () => window.removeEventListener("resize", onResize);
// //   }, []);

// //   useEffect(() => {
// //     const konami = [
// //       "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
// //       "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
// //       "b","a"
// //     ];
// //     let input = [];
// //     let idCounter = 0;

// //     const onKeyDown = (e) => {
// //       input.push(e.key);
// //       if (input.length > konami.length) input.shift();

// //       if (input.join(",").toLowerCase() === konami.join(",").toLowerCase()) {
// //         const newId = idCounter++;
// //         const newBottom = Math.floor(Math.random() * 250) + 50;

// //         setActive((prev) => [...prev, { id: newId, bottom: newBottom }]);

// //         // アニメーション時間を画面幅に比例（例：1000pxで4秒）
// //         const animDuration = Math.max(2, (windowWidth / 1000) * 4); // 最低2秒、最大は画面幅に比例

// //         setTimeout(() => {
// //           setActive((prev) => prev.filter((item) => item.id !== newId));
// //         }, animDuration * 1000);

// //         input = [];
// //       }
// //     };

// //     window.addEventListener("keydown", onKeyDown);
// //     return () => window.removeEventListener("keydown", onKeyDown);
// //   }, [windowWidth]);

// //   // アニメーション時間の計算（再レンダリング時にも使う）
// //   const animationDuration = Math.max(2, (windowWidth / 1000) * 4); // 2秒〜（例）

// //   return (
// //     <>
// //       {active.map(({ id, bottom }) => (
// //         <img
// //           key={id}
// //           src="/img/koisshi.png"
// //           style={{
// //             position: "fixed",
// //             bottom: `${bottom}px`,
// //             right: "-150px",
// //             width: "100px",
// //             height: "100px",
// //             animation: `roll-left ${animationDuration}s linear forwards`,
// //             zIndex: 9999,
// //           }}
// //         />
// //       ))}

// //       <style>{`
// //         @keyframes roll-left {
// //           0% {
// //             right: -150px;
// //             transform: rotate(0deg);
// //           }
// //           100% {
// //             right: 100vw;
// //             transform: rotate(-1080deg);
// //           }
// //         }
// //       `}</style>
// //     </>
// //   );
// // }
