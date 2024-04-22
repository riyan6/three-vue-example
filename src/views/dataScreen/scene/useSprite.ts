import * as THREE from "three";

// 机台名称:包装机1#
// 当前牌号:牌号A
// 运行状态：正常运行
export default function () {
  const createCanvasSprite = (names: string[]): THREE.Sprite => {
    // 创建一个canvas对象，绘制几何图案或添加文字
    const canvas = document.createElement("canvas");

    let max = 0;
    names.forEach((r) => {
      const arr = r.split(""); //分割为单独字符串
      let num = 0;
      const reg = /[\u4e00-\u9fa5]/;
      for (let i = 0; i < arr.length; i++) {
        if (reg.test(arr[i])) {
          //判断是不是汉字
          num += 1;
        } else {
          num += 0.5; //英文字母或数字累加0.5
        }
      }
      max = Math.max(max, num);
    });

    // 根据字符串符号类型和数量、文字font-size大小来设置canvas画布宽高度
    //根据渲染像素大小设置，过大性能差，过小不清晰
    const h = 320;
    const w = h + (max * 32);
    canvas.width = w;
    canvas.height = h;

    const c: CanvasRenderingContext2D | any = canvas.getContext("2d");

    // 定义轮廓颜色，黑色半透明
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // 文字
    c.beginPath();
    c.translate(w / 2, h / 4);
    // 文本填充颜色
    c.fillStyle = "#ffffff";
    // 字体样式设置
    c.font = "normal 48px 宋体";
    // 文本与fillText定义的纵坐标
    c.textBaseline = "middle";
    // 文本居中(以fillText定义的横坐标)
    c.textAlign = "center";
    names.forEach((r: string, index: number) => {
      c.fillText(r, 0, index * 90);
    })

    // 创建
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    // 精灵y方向尺寸
    const y = 120;
    // sprite宽高比和canvas画布保持一致
    //精灵x方向尺寸
    const x = (canvas.width / canvas.height) * y;
    // 控制精灵大小
    sprite.scale.set(x, y, 1);
    // 标签底部箭头和空对象标注点重合
    sprite.position.y = y / 2;

    return sprite;
  };

  return {
    createCanvasSprite,
  };
}
