const makePath = (count) => {
  const paths = [];
  // 만약 count가 2개 이하이면 기본값 직선으로 반환
  if (count <= 2)
    return [
      [0, 350],
      [1500, 350],
    ];
  const weightX = Math.trunc(1500 / (count-1));

  for (let i = 0; i < count; i++) {
    let x = weightX * i;
    if (i === count - 1) x = 1500;
    const y = Math.trunc(Math.random() * 200) + 200;
    paths.push([x, y]);
  }

  return paths;
};

export default makePath;
