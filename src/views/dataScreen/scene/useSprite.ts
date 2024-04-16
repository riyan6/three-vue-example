import * as THREE from 'three'

export default function () {
  const createCanvasSprite = (name: string): THREE.Sprite => {
    // 创建一个canvas对象，绘制几何图案或添加文字
    const canvas = document.createElement("canvas");
    const arr = name.split(""); //分割为单独字符串
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
    // 根据字符串符号类型和数量、文字font-size大小来设置canvas画布宽高度
    const h = 80; //根据渲染像素大小设置，过大性能差，过小不清晰
    const w = h + num * 32;
    canvas.width = w;
    canvas.height = h;
    const h1 = h * 0.8;
    const c: CanvasRenderingContext2D | any = canvas.getContext("2d");
    // 定义轮廓颜色，黑色半透明
    c.fillStyle = "rgba(0,0,0,0.5)";
    // 绘制半圆+矩形轮廓
    const R = h1 / 2;
    c.arc(R, R, R, -Math.PI / 2, Math.PI / 2, true); //顺时针半圆
    c.arc(w - R, R, R, Math.PI / 2, -Math.PI / 2, true); //顺时针半圆
    c.fill();
    // 绘制箭头
    c.beginPath();
    const h2 = h - h1;
    c.moveTo(w / 2 - h2 * 0.6, h1);
    c.lineTo(w / 2 + h2 * 0.6, h1);
    c.lineTo(w / 2, h);
    c.fill();
    // 文字
    c.beginPath();
    c.translate(w / 2, h1 / 2);
    c.fillStyle = "#ffffff"; //文本填充颜色
    c.font = "normal 32px 宋体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(name, 0, 0);
    
    // 创建
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    const y = 30; //精灵y方向尺寸
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
