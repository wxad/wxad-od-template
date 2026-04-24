'use client';

import clsx from 'clsx';
import * as d3 from 'd3';
import { Select } from 'one-design-next';
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimationPlaybackControls,
  MotionValue,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  layer1,
  layer1Current,
  layer2,
  layer3,
  layer4,
  mockData,
  tagStyles,
  type TopIP,
} from './consts';

/** 区块文档预览固定参数（观感对齐 Chart 案例，无 CodeBox / Tweakpane） */
const PARAMS = {
  useHoverFill: true,
  hoverVisible: false,
  transitionType: 'small' as const,
  visualDuration: 0.4,
  bounce: 0.2,
  dataCount: 6,
  hasPopover: true,
};

// 核心尺寸常量
const CONTAINER_SIZE = 800; // 主容器尺寸
const TAG_SIZE = 104; // 标签尺寸
const CENTER_CIRCLE_SIZE = 160; // 中心圆尺寸
const DOT_SIZE = 12; // 小圆点尺寸

// 计算值
const TAG_OFFSET = (CONTAINER_SIZE - TAG_SIZE) / 2; // 348

// 气泡配置
const BUBBLE_MIN_RADIUS = 56; // 气泡最小半径
const BUBBLE_MAX_RADIUS = 135; // 气泡最大半径

// 其他配置
const POPOVER_OFFSET = 24; // Popover 偏移量
const LAYER_TIMEOUT = 200; // 图层超时时间

// 根据 parentIndex, mockData 判断 Tag 是否是文字在下，圆点在上的排列，如果是则返回 true
const REVERSE_TAG_INDICES: Record<number, number[]> = {
  6: [2, 3, 4],
  5: [1, 2, 3],
  4: [2],
  3: [1],
};

const isReverseTag = ({
  parentIndex,
  totalLength,
}: {
  parentIndex: number;
  totalLength: number;
}) => {
  return REVERSE_TAG_INDICES[totalLength]?.includes(parentIndex) ?? false;
};

// 也是一个比较特殊的方法，根据 totalLength 计算出 sector 的 offset
const SECTOR_OFFSETS: Record<number, number> = {
  3: 60,
  4: 0,
  5: 36,
  6: 0,
};

const getSectorOffset = (totalLength: number) => {
  return SECTOR_OFFSETS[totalLength] ?? 0;
};

type TagMouseOptions = {
  parentIndex: number;
  index: number;
  el: HTMLDivElement | null;
  name: string;
};

interface BubbleNode {
  name: string;
  percent: number;
  r: number;
  x: number;
  y: number;
  rank: number;
}

interface BubbleDataItem {
  name: string;
  percent: number;
}

/**
 * 计算气泡布局
 * @param rawData 原始数据数组
 * @param containerSize 容器尺寸
 * @param centerCircleSize 中心圆尺寸
 * @param minRadius 气泡最小半径
 * @param maxRadius 气泡最大半径
 * @returns 布局计算完成的气泡节点数组
 */
const calculateBubbleLayout = (
  rawData: BubbleDataItem[],
  containerSize: number,
  centerCircleSize: number,
  minRadius: number,
  maxRadius: number,
): BubbleNode[] => {
  const width = containerSize;
  const height = containerSize;
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = centerCircleSize / 2;
  const containerRadius = containerSize / 2;

  const maxPercent = Math.max(...rawData.map((d) => d.percent));

  // 按 percent 降序排序并计算排名
  const sortedData = [...rawData].sort((a, b) => b.percent - a.percent);

  // 计算排名数组（相同 percent 的项具有相同排名）
  const ranks: number[] = [];
  sortedData.forEach((item, index) => {
    if (index > 0 && sortedData[index - 1].percent === item.percent) {
      ranks.push(ranks[index - 1]);
    } else {
      ranks.push(index + 1);
    }
  });

  const sortedDataWithRank = sortedData.map((item, index) => ({
    ...item,
    rank: ranks[index],
  }));

  interface SimulationNode extends d3.SimulationNodeDatum {
    name: string;
    percent: number;
    r: number;
    x: number;
    y: number;
    rank: number;
  }

  // 按比例计算所有圆的初始半径
  // 使用平方根尺度，因为圆的面积 ∝ r²，这样视觉上的面积与数据成正比
  const initialRadii = sortedDataWithRank.map((item) => {
    // 使用平方根映射，让面积与 percent 成正比
    const normalizedValue = Math.sqrt(item.percent / maxPercent);
    const radius = minRadius + normalizedValue * (maxRadius - minRadius);
    return radius;
  });

  // 估算可用空间
  const availableRadius = containerRadius - centerRadius - 20; // 留 20px 边距
  const maxInitialRadius = Math.max(...initialRadii);
  const totalArea = initialRadii.reduce((sum, r) => sum + Math.PI * r * r, 0);
  const availableArea = Math.PI * availableRadius * availableRadius * 0.7;

  // 计算缩放因子
  let scaleFactor = 1;
  if (totalArea > availableArea) {
    scaleFactor = Math.sqrt(availableArea / totalArea);
  }
  if (maxInitialRadius * scaleFactor > availableRadius * 0.45) {
    scaleFactor = (availableRadius * 0.45) / maxInitialRadius;
  }

  // 创建节点
  const nodes: SimulationNode[] = sortedDataWithRank.map((item, index) => {
    let radius = initialRadii[index] * scaleFactor;
    radius = Math.max(radius, minRadius);

    return {
      name: item.name,
      percent: item.percent,
      r: radius,
      x: centerX + (Math.random() - 0.5) * (containerSize / 2),
      y: centerY + (Math.random() - 0.5) * (containerSize / 2),
      rank: item.rank,
    };
  });

  // 创建力模拟
  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(5))
    .force(
      'collision',
      d3
        .forceCollide<SimulationNode>()
        .radius((d) => d.r + 4)
        .strength(1),
    )
    .force('x', d3.forceX(centerX).strength(0.02))
    .force('y', d3.forceY(centerY).strength(0.02))
    .force('center-avoid', () => {
      // 自定义力：避免覆盖中心圆
      nodes.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = centerRadius + node.r + 8;

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          node.x = centerX + Math.cos(angle) * minDistance;
          node.y = centerY + Math.sin(angle) * minDistance;
        }
      });
    })
    .force('boundary', () => {
      // 自定义力：保持在容器边界内
      nodes.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = containerRadius - node.r - 5;

        if (distance > maxDistance) {
          const angle = Math.atan2(dy, dx);
          node.x = centerX + Math.cos(angle) * maxDistance;
          node.y = centerY + Math.sin(angle) * maxDistance;
        }
      });
    })
    .stop();

  // 手动运行模拟直到稳定
  let maxIterations = 500;
  while (simulation.alpha() > 0.001 && maxIterations > 0) {
    simulation.tick();
    maxIterations--;
  }

  return nodes.map((node) => ({
    name: node.name,
    percent: node.percent,
    r: node.r,
    x: node.x,
    y: node.y,
    rank: node.rank,
  }));
};

/**
 * @param parentIndex 父级 index（目前只写了 6 个的情况，从正上方开始，顺时针方向为 0，1，2，3，4，5）
 * TODO: index 布局可能和现网不同
 * @param index 在父级下的第几个 index
 * @param onMouseEnter 主要做 hoverFill 跟随以及 Popover 设置
 * @param onMouseLeave 主要做 hoverFill 隐藏以及 Popover 设置
 * @param onClick 父组件统一处理状态
 * @param name
 * @param level0PointerEvents 用以控制是否能够交互，因在 level1 时禁用交互
 * @returns
 */
const Tag = ({
  parentIndex,
  index,
  onMouseEnter,
  onMouseLeave,
  onClick,
  name,
  params,
  level0PointerEvents,
  totalLength,
}: {
  parentIndex: number;
  index: number;
  onMouseEnter?: (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => void;
  onMouseLeave?: (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => void;
  onClick?: (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => void;
  name: string;
  params: {
    hoverVisible: boolean;
  };
  level0PointerEvents: MotionValue<string>;
  totalLength: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const isReverse = isReverseTag({ parentIndex, totalLength });

  return (
    <div
      className="absolute flex flex-col text-center hover:z-10"
      style={{
        width: TAG_SIZE,
        height: TAG_SIZE,
        transform: `translate3d(${tagStyles[Number(totalLength) as keyof typeof tagStyles]?.[index]?.x}px, ${tagStyles[Number(totalLength) as keyof typeof tagStyles]?.[index]?.y}px, 0) rotate(calc(var(--sector-index) * var(--sector-angle) * -1deg + var(--sector-offset) * -1deg))`,
      }}
      ref={ref}
    >
      <div
        className="relative z-10 mx-auto w-fit min-w-[52px] max-w-[70%] select-none pb-4 pt-5 text-[13px] leading-[22px] text-black-11"
        style={{
          marginTop: isReverse ? 'auto' : undefined,
        }}
      >
        <div className="truncate">{name}</div>
        <motion.div
          className={clsx(
            'absolute left-0 z-10 h-full w-full cursor-pointer hover:left-1/2 hover:h-[104px] hover:w-[104px] hover:-translate-x-1/2 hover:rounded-full',
            !isReverse && 'top-0',
            isReverse && 'bottom-0',
          )}
          onMouseEnter={(e) =>
            onMouseEnter?.(e, { parentIndex, index, el: ref.current, name })
          }
          onMouseLeave={(e) =>
            onMouseLeave?.(e, { parentIndex, index, el: ref.current, name })
          }
          onClick={
            onClick
              ? (e) =>
                  onClick?.(e, { parentIndex, index, el: ref.current, name })
              : undefined
          }
          style={{
            pointerEvents: level0PointerEvents,
            background: params.hoverVisible
              ? 'rgba(0, 0, 0, 0.1)'
              : 'transparent',
          }}
        />
      </div>
      <div
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--odn-primary-color)] opacity-80"
        style={{ width: DOT_SIZE, height: DOT_SIZE }}
      />
    </div>
  );
};

const CrystalBallInsightVisual = () => {
  const [currentHoverCategory, setCurrentHoverCategory] = useState<{
    parentIndex: number;
    childIndex?: number;
    data: (typeof mockData)[number];
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentTagEl = useRef<HTMLDivElement | null>(null);
  const layerMouseLeaveTimer = useRef(0);
  const tagHoverFillTimer = useRef(0);
  const tagHoverFillVisible = useRef(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const popoverX = useSpring(0, {
    visualDuration: 0.3,
    bounce: 0,
  });
  const popoverY = useSpring(0, {
    visualDuration: 0.3,
    bounce: 0,
  });
  const currentTagName = useMotionValue('');
  const currentTagMarginTop = useMotionValue('');
  const currentTagTextPlaceholderTransformOrigin = useMotionValue(
    '50% calc(100% + 16px)',
  );
  const tagHoverFillX = useSpring(0, {
    visualDuration: 0.15,
    bounce: 0,
  });
  const tagHoverFillY = useSpring(0, {
    visualDuration: 0.15,
    bounce: 0,
  });
  const tagHoverFillXSaved = useRef(0);
  const tagHoverFillYSaved = useRef(0);
  const tagHoverFillScale = useSpring(1, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });
  const tagHoverFillOpacity = useSpring(0, {
    visualDuration: 0.15,
    bounce: 0,
    restDelta: 0.001,
  });

  const animateRef = useRef<AnimationPlaybackControls | null>(null);

  // 0 表示第一层，1 表示第二层
  const viewLevel = useMotionValue(0);
  const [animating, setAnimating] = useState(false);
  const level0Opacity = useSpring(1, {
    visualDuration: 0.2,
    bounce: 0,
    restDelta: 0.001,
  });

  const level0Scale = useTransform(level0Opacity, [1, 0], [1, 0.95]);

  const level0Filter = useTransform(
    level0Opacity,
    [1, 0],
    ['blur(0px)', 'blur(3px)'],
  );

  const level0OpacityBig = useSpring(1, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });

  const level0ScaleBig = useTransform(
    level0OpacityBig,
    [1, 0],
    [1, CONTAINER_SIZE / TAG_SIZE],
    { clamp: false },
  );
  const level0TransformOriginBig = useMotionValue('');
  const level0XBig = useSpring(0, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });
  const level0YBig = useSpring(0, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });

  const level1Progress = useSpring(0, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });

  const tagHoverFillBg = useTransform(
    level1Progress,
    [0, 1],
    [
      'radial-gradient(50% 50% at 50% 50%, rgba(82, 137, 246, 0.2) 0%, rgba(82, 137, 246, 0.2) 100%)',
      'radial-gradient(50% 50% at 50% 50%, rgba(224, 234, 255, 1) 0%, rgba(251, 252, 255, 1) 100%)',
    ],
  );

  const level1Scale = useTransform(
    level1Progress,
    [0, 1],
    [TAG_SIZE / CONTAINER_SIZE, 1],
    {
      clamp: false,
    },
  );

  const level1TextPlaceholderScale = useTransform(
    level1Progress,
    [0, 1],
    [1, CONTAINER_SIZE / TAG_SIZE],
    {
      clamp: false,
    },
  );

  const level1TextPlaceholderOpacity = useSpring(0, {
    visualDuration: 0.15,
    bounce: 0,
    restDelta: 0.001,
  });

  const level1IndicatorScale = useTransform(
    level1Progress,
    [0, 1],
    [DOT_SIZE / CENTER_CIRCLE_SIZE, 1],
    {
      clamp: false,
    },
  );

  const level1Border = useTransform(
    level1Progress,
    [0.5, 1],
    ['1px solid rgba(225, 235, 255, 0)', '1px solid rgba(225, 235, 255, 1)'],
  );

  const level1Opacity = useMotionValue(0);
  const level0PointerEvents = useMotionValue('auto');
  const level1PointerEvents = useMotionValue('none');

  const level1BubbleOpacity = useSpring(0, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
    restDelta: 0.001,
  });
  const level1BubbleScale = useSpring(0, {
    visualDuration: PARAMS.visualDuration,
    bounce: PARAMS.bounce,
  });

  const [bubbles, setBubbles] = useState<BubbleNode[]>([]);
  const [filterDimension, setFilterDimension] = useState('all');
  const [filterSort, setFilterSort] = useState('ta');
  const [filterTa, setFilterTa] = useState<string | undefined>(undefined);
  const [filterTgi, setFilterTgi] = useState<string | undefined>(undefined);

  // 根据 dataCount 动态切片数据
  const displayData = mockData.slice(0, PARAMS.dataCount);

  const handleLayerMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    options: { parentIndex: number },
  ) => {
    const { parentIndex } = options;
    if (viewLevel.get() !== 0) return;
    setCurrentHoverCategory({
      parentIndex,
      childIndex: undefined,
      data: displayData[parentIndex],
    });
  };

  const handleLayerMouseLeave = (
    e: React.MouseEvent<HTMLDivElement>,
    options: { parentIndex: number },
  ) => {
    // setCurrentHoverCategory(null);
  };

  const handleTagMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => {
    if (viewLevel.get() !== 0) return;

    e.persist();
    clearTimeout(tagHoverFillTimer.current);

    const { el, parentIndex, index } = options;

    if (!el || !wrapperRef.current) {
      return;
    }

    setCurrentHoverCategory({
      parentIndex,
      childIndex: index,
      data: displayData[parentIndex],
    });

    const wrapper = wrapperRef.current.getBoundingClientRect();
    const target = el.getBoundingClientRect();

    const finalLeft =
      target.left - wrapper.left - wrapper.width / 2 + target.width / 2;
    const finalTop =
      target.top - wrapper.top - wrapper.height / 2 + target.height / 2;

    tagHoverFillXSaved.current = finalLeft;
    tagHoverFillYSaved.current = finalTop;

    setTimeout(() => {
      tagHoverFillOpacity.set(1);
    }, 0);

    if (!tagHoverFillVisible.current) {
      tagHoverFillVisible.current = true;
      setTimeout(() => {
        animateRef.current?.stop();
        tagHoverFillX.jump(finalLeft);
        tagHoverFillY.jump(finalTop);
      }, 0);
    } else {
      setTimeout(() => {
        animateRef.current?.stop();
        if (PARAMS.useHoverFill) {
          tagHoverFillX.set(finalLeft);
          tagHoverFillY.set(finalTop);
        } else {
          tagHoverFillX.jump(finalLeft);
          tagHoverFillY.jump(finalTop);
        }
      }, 0);
    }
  };
  const handleTagMouseLeave = (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => {
    if (viewLevel.get() !== 0) return;

    e.persist();
    clearTimeout(tagHoverFillTimer.current);

    tagHoverFillTimer.current = window.setTimeout(async () => {
      tagHoverFillOpacity.set(0);
      await new Promise((resolve) => setTimeout(resolve, 200));
      tagHoverFillVisible.current = false;
    }, 200);
  };
  const handleTagClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    options: TagMouseOptions,
  ) => {
    const { el, name, parentIndex, index } = options;

    setPopoverVisible(false);

    // 获取对应的数据
    const currentCategory = displayData[parentIndex]?.children[index];
    if (
      !currentCategory ||
      !currentCategory.children ||
      !wrapperRef.current ||
      !el
    ) {
      return;
    }

    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
    }, PARAMS.visualDuration * 1000);

    const rawData = currentCategory.children;

    // 计算气泡布局
    const bubbles = calculateBubbleLayout(
      rawData,
      CONTAINER_SIZE,
      CENTER_CIRCLE_SIZE,
      BUBBLE_MIN_RADIUS,
      BUBBLE_MAX_RADIUS,
    );

    // 更新气泡数据
    setBubbles(bubbles);

    if (PARAMS.transitionType === 'small') {
      if (el) {
        currentTagEl.current = el;
        el.style.opacity = '0';
      }
      level1TextPlaceholderOpacity.jump(1);
      currentTagName.set(name);
      if (isReverseTag({ parentIndex, totalLength: displayData.length })) {
        currentTagMarginTop.set('auto');
        currentTagTextPlaceholderTransformOrigin.set('50% 0');
      } else {
        currentTagMarginTop.set('');
        currentTagTextPlaceholderTransformOrigin.set('50% calc(100% + 16px)');
      }
      viewLevel.set(1);
      level0Opacity.set(0);
      animateRef.current?.stop();
      level1Opacity.set(1);
      await new Promise((resolve) => setTimeout(resolve, 30));
      level1TextPlaceholderOpacity.set(0);
      animateRef.current = animate(1, 0, {
        type: 'spring',
        stiffness: 170,
        damping: 26,
        restDelta: 0.001,
        onUpdate: (value: number) => {
          tagHoverFillX.jump(tagHoverFillXSaved.current * value);
          tagHoverFillY.jump(tagHoverFillYSaved.current * value);
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      tagHoverFillScale.set(CONTAINER_SIZE / TAG_SIZE);
      level1Progress.set(1);
      level1PointerEvents.set('auto');
      level0PointerEvents.set('none');
      tagHoverFillOpacity.jump(1);

      await new Promise((resolve) => setTimeout(resolve, 40));
      level1BubbleOpacity.set(1);
      level1BubbleScale.set(1);
    } else {
      level0OpacityBig.set(0);
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // 计算出正确的 transformOrigin，从点击的 el 中心放大
      const elCenterX = elRect.left - wrapperRect.left + elRect.width / 2;
      const elCenterY = elRect.top - wrapperRect.top + elRect.height / 2;

      level0TransformOriginBig.set(`${elCenterX}px ${elCenterY}px`);

      level0XBig.set(
        wrapperRect.left +
          wrapperRect.width / 2 -
          elRect.left -
          elRect.width / 2,
      );
      level0YBig.set(
        wrapperRect.top +
          wrapperRect.height / 2 -
          elRect.top -
          elRect.height / 2,
      );

      if (el) {
        currentTagEl.current = el;
        el.style.opacity = '0';
      }
      level1TextPlaceholderOpacity.jump(1);
      currentTagName.set(name);
      if (isReverseTag({ parentIndex, totalLength: displayData.length })) {
        currentTagMarginTop.set('auto');
        currentTagTextPlaceholderTransformOrigin.set('50% 0');
      } else {
        currentTagMarginTop.set('');
        currentTagTextPlaceholderTransformOrigin.set('50% calc(100% + 16px)');
      }
      viewLevel.set(1);
      level0Opacity.set(0);
      level1Opacity.set(1);
      animateRef.current?.stop();

      await new Promise((resolve) => setTimeout(resolve, 0));
      level1TextPlaceholderOpacity.set(0);
      animateRef.current = animate(1, 0, {
        type: 'spring',
        visualDuration: PARAMS.visualDuration,
        bounce: PARAMS.bounce,
        restDelta: 0.001,
        onUpdate: (value: number) => {
          tagHoverFillX.jump(tagHoverFillXSaved.current * value);
          tagHoverFillY.jump(tagHoverFillYSaved.current * value);
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      tagHoverFillScale.set(CONTAINER_SIZE / TAG_SIZE);
      level1Progress.set(1);
      level1PointerEvents.set('auto');
      level0PointerEvents.set('none');
      tagHoverFillOpacity.jump(1);

      await new Promise((resolve) => setTimeout(resolve, 40));
      level1BubbleOpacity.set(1);
      level1BubbleScale.set(1);
    }
  };

  const handleLevel1ToLevel0 = async () => {
    if (viewLevel.get() === 0 || animating) {
      return;
    }

    animateRef.current?.stop();

    setAnimating(true);
    viewLevel.set(0);
    level1BubbleOpacity.set(0);
    level1BubbleScale.set(0);

    tagHoverFillScale.set(1);
    level1Progress.set(0);

    if (PARAMS.transitionType === 'big') {
      level0OpacityBig.set(1);
      level0ScaleBig.set(1);
      level0XBig.set(0);
      level0YBig.set(0);
    }

    await new Promise((resolve) => setTimeout(resolve, 30));
    animateRef.current = animate(0, 1, {
      type: 'spring',
      stiffness: 170,
      damping: 26,
      restDelta: 0.001,
      onUpdate: (value: number) => {
        tagHoverFillX.jump(tagHoverFillXSaved.current * value);
        tagHoverFillY.jump(tagHoverFillYSaved.current * value);
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    level1TextPlaceholderOpacity.set(1);
    level0Opacity.set(1);
    // 下面的这两个值保持之和 500，才能保证 500 之后的动画衔接
    const totalTimeout = 500;
    const firstTimeout = 100;
    await new Promise((resolve) => setTimeout(resolve, firstTimeout));
    tagHoverFillOpacity.set(0);
    await new Promise((resolve) =>
      setTimeout(resolve, totalTimeout - firstTimeout),
    );

    const onComplete = () => {
      setAnimating(false);
      currentTagName.set('');
      level1Opacity.set(0);
      if (currentTagEl.current) {
        currentTagEl.current.style.opacity = '1';
      }
      level1TextPlaceholderOpacity.set(0);
      tagHoverFillVisible.current = false;
      level1PointerEvents.set('none');
      level0PointerEvents.set('auto');
    };

    onComplete();
  };

  const handleWrapperMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    clearTimeout(layerMouseLeaveTimer.current);
    if (viewLevel.get() === 0) {
      setPopoverVisible(true);
      const newX = e.clientX + POPOVER_OFFSET;
      const newY = e.clientY + POPOVER_OFFSET;
      if (!popoverVisible) {
        popoverX.jump(newX);
        popoverY.jump(newY);
      } else {
        popoverX.set(newX);
        popoverY.set(newY);
      }
    } else {
      setPopoverVisible(false);
    }
  };

  const handleWrapperMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    clearTimeout(layerMouseLeaveTimer.current);
    layerMouseLeaveTimer.current = window.setTimeout(() => {
      setPopoverVisible(false);
    }, LAYER_TIMEOUT);
  };

  const handlePopoverMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    clearTimeout(layerMouseLeaveTimer.current);
    if (viewLevel.get() === 0) {
      setPopoverVisible(true);
    }
  };

  const handlePopoverMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    clearTimeout(layerMouseLeaveTimer.current);
    layerMouseLeaveTimer.current = window.setTimeout(() => {
      setPopoverVisible(false);
    }, LAYER_TIMEOUT);
  };

  const currentHoverData = currentHoverCategory?.data;
  const currentHoverTopIPs = (currentHoverData as { topIPs?: TopIP[] } | undefined)
    ?.topIPs;

  return (
    <div className="flex flex-col gap-4 px-2">
        <div className="mx-auto flex w-full max-w-[800px] items-center justify-between p-0">
          <div className="text-lg font-semibold text-black-12">人群洞察</div>
          <a
            href="#"
            className="cursor-pointer text-[13px] text-black-9 no-underline hover:text-[var(--odn-primary-color)]"
          >
            ↓ 下载数据
          </a>
        </div>
        <div className="mx-auto mb-4 flex w-full max-w-[800px] flex-wrap items-center gap-2">
          <Select
            className="w-[200px]"
            size="small"
            allowClear={false}
            value={filterDimension}
            onChange={(v) => setFilterDimension(String(v))}
            options={[
              { label: '达人偏好、行业R0人群、品…', value: 'all' },
              { label: '仅达人偏好', value: 'talent' },
              { label: '仅行业推荐', value: 'industry' },
            ]}
          />
          <Select
            className="w-[140px]"
            size="small"
            allowClear={false}
            value={filterSort}
            onChange={(v) => setFilterSort(String(v))}
            options={[
              { label: '按TA%排序', value: 'ta' },
              { label: '按TGI排序', value: 'tgi' },
            ]}
          />
          <Select
            className="w-[140px]"
            size="small"
            allowClear={false}
            placeholder="TA% 请选择"
            value={filterTa}
            onChange={(v) => setFilterTa(v != null && v !== '' ? String(v) : undefined)}
            options={[
              { label: 'TA% ≥ 30%', value: '30' },
              { label: 'TA% ≥ 20%', value: '20' },
              { label: 'TA% ≥ 10%', value: '10' },
            ]}
          />
          <Select
            className="w-[140px]"
            size="small"
            allowClear={false}
            placeholder="TGI 请选择"
            value={filterTgi}
            onChange={(v) => setFilterTgi(v != null && v !== '' ? String(v) : undefined)}
            options={[
              { label: 'TGI ≥ 200', value: '200' },
              { label: 'TGI ≥ 150', value: '150' },
              { label: 'TGI ≥ 100', value: '100' },
            ]}
          />
        </div>
        <div
          ref={wrapperRef}
          className="relative mx-auto rounded-full"
          style={{
            width: CONTAINER_SIZE,
            height: CONTAINER_SIZE,
            overflow: PARAMS.transitionType === 'big' ? 'hidden' : '',
            boxShadow:
              PARAMS.transitionType === 'big' ? '0 0 0 1px #cddeff' : '',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            onMouseMove={handleWrapperMouseMove}
            onMouseLeave={handleWrapperMouseLeave}
          >
            <motion.div
              className="absolute inset-0 rounded-full [clip-path:circle(50%)]"
              style={{
                opacity:
                  PARAMS.transitionType === 'small'
                    ? level0Opacity
                    : level0OpacityBig,
                filter: PARAMS.transitionType === 'small' ? level0Filter : '',
                scale:
                  PARAMS.transitionType === 'small'
                    ? level0Scale
                    : level0ScaleBig,
                transformOrigin:
                  PARAMS.transitionType === 'small'
                    ? ''
                    : level0TransformOriginBig,
                x: level0XBig,
                y: level0YBig,
              }}
            >
              {displayData.map((_, i) => {
                const isCurrentLayer =
                  currentHoverCategory?.parentIndex === i && popoverVisible;
                const isBackLayer =
                  currentHoverCategory?.parentIndex !== i && popoverVisible;
                return (
                  <section
                    data-index={i}
                    key={i}
                    style={{
                      opacity: isBackLayer ? 0.5 : 1,
                      '--sector-index': i,
                      '--sector-angle': 360 / displayData.length,
                      '--sector-offset': getSectorOffset(displayData.length),
                      '--sector-path': [
                        '',
                        '',
                        'polygon(0% 0%, 100% 0%, 100% 42.26%, 50% 100%, 0% 42.26%)',
                        'polygon(0% 0%, 100% 0%, 50% 100%)',
                        'polygon(13.66% 0%, 86.34% 0%, 50% 100%)',
                        'polygon(21.13% 0%, 78.87% 0%, 50% 100%)',
                      ][displayData.length - 1],
                    }}
                    className="transition-opacity duration-200"
                  >
                    <motion.div className="pointer-events-none absolute inset-0 [transform:rotate(calc(var(--sector-index)*var(--sector-angle)*1deg+var(--sector-offset)*1deg))]">
                      <div
                        className="pointer-events-auto absolute bottom-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 [clip-path:var(--sector-path)]"
                        onMouseEnter={(e) =>
                          handleLayerMouseEnter(e, {
                            parentIndex: i,
                          })
                        }
                        onMouseLeave={(e) =>
                          handleLayerMouseLeave(e, {
                            parentIndex: i,
                          })
                        }
                      >
                        {layer4}
                      </div>
                      <div className="pointer-events-none absolute bottom-1/2 left-1/2 h-[320px] w-[640px] -translate-x-1/2 [clip-path:var(--sector-path)]">
                        {layer3}
                      </div>
                      <div className="pointer-events-none absolute bottom-1/2 left-1/2 h-[240px] w-[480px] -translate-x-1/2 [clip-path:var(--sector-path)]">
                        {layer2}
                      </div>
                      <div className="pointer-events-none absolute bottom-1/2 left-1/2 h-[160px] w-[320px] -translate-x-1/2 [clip-path:var(--sector-path)]">
                        {isCurrentLayer ? layer1Current : layer1}
                      </div>
                    </motion.div>
                    <div className="pointer-events-none absolute inset-0 z-10 [transform:rotate(calc(var(--sector-index)*var(--sector-angle)*1deg+var(--sector-offset)*1deg))]">
                      <div className="absolute bottom-1/2 left-1/2 h-1/2 w-full -translate-x-1/2">
                        <div className="absolute bottom-0 left-1/2 h-px w-1/2 origin-left bg-[#cddeff] [transform:rotate(calc((180-var(--sector-angle))/2*-1deg))]" />
                      </div>
                    </div>
                    <motion.div className="pointer-events-none absolute inset-0 z-10 [transform:rotate(calc(var(--sector-index)*var(--sector-angle)*1deg+var(--sector-offset)*1deg))]">
                      <div
                        className="absolute left-1/2 top-[248px] flex min-h-[72px] items-center justify-center whitespace-break-spaces text-center text-base font-semibold leading-6"
                        style={{
                          transform: `translate3d(-50%, 0, 0) rotate(${isReverseTag({ parentIndex: i, totalLength: displayData.length }) ? 180 : 0}deg)`,
                          color: isCurrentLayer ? '#fff' : '#296BEF',
                        }}
                      >
                        {displayData[i].name}
                      </div>
                      {displayData[i].children.map((_, j) => (
                        <Tag
                          key={j}
                          parentIndex={i}
                          index={j}
                          onMouseEnter={handleTagMouseEnter}
                          onMouseLeave={handleTagMouseLeave}
                          onClick={handleTagClick}
                          name={displayData[i].children[j].name}
                          params={PARAMS}
                          level0PointerEvents={level0PointerEvents}
                          totalLength={displayData.length}
                        />
                      ))}
                    </motion.div>
                  </section>
                );
              })}
              <motion.div
                className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#93b7ff] bg-[var(--odn-primary-color)] text-xl font-semibold leading-8 text-white shadow-[inset_0_0_24px_-8px_rgba(255,255,255,0.5)]"
                style={{
                  width: CENTER_CIRCLE_SIZE,
                  height: CENTER_CIRCLE_SIZE,
                }}
              >
                <div className="max-w-[63%] text-center">
                  年轻科技
                  <br />
                  爱好者
                </div>
              </motion.div>
              {PARAMS.transitionType === 'small' && (
                <motion.div className="pointer-events-none absolute inset-0 rounded-full border border-[#cddeff]" />
              )}
            </motion.div>
            <motion.div
              className="pointer-events-none absolute z-20 rounded-full"
              style={{
                top: TAG_OFFSET,
                left: TAG_OFFSET,
                width: TAG_SIZE,
                height: TAG_SIZE,
                x: tagHoverFillX,
                y: tagHoverFillY,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  opacity: tagHoverFillOpacity,
                  scale: tagHoverFillScale,
                  background: tagHoverFillBg,
                }}
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 z-20 rounded-full"
              style={{
                x: tagHoverFillX,
                y: tagHoverFillY,
                pointerEvents: level1PointerEvents,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: PARAMS.transitionType === 'small' ? level1Border : '',
                  opacity: level1Opacity,
                  scale: level1Scale,
                }}
              />
              {/* 气泡 */}
              {(() => {
                return bubbles.map((bubble, bubbleIndex) => {
                  let topMarginBottom = '8px';
                  let topFontSize = '20px';
                  let nameFontSize = '16px';
                  let nameLineHeight = '24px';
                  let percentFontSize = '18px';
                  let percentLineHeight = '26px';
                  if (bubble.r < 100) {
                    topMarginBottom = '0';
                    topFontSize = '16px';
                    nameFontSize = '14px';
                    nameLineHeight = '22px';
                    percentFontSize = '16px';
                    percentLineHeight = '24px';
                  }

                  return (
                    <motion.div
                      key={`${bubble.name}-${bubbleIndex}`}
                      className="pointer-events-none absolute flex select-none flex-col items-center justify-center rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.4)_0%,#ffffff_100%)]"
                      style={{
                        opacity: level1BubbleOpacity,
                        scale: level1BubbleScale,
                        transformOrigin: `${CONTAINER_SIZE / 2 - bubble.x + bubble.r}px ${CONTAINER_SIZE / 2 - bubble.y + bubble.r}px`,
                        left: `${bubble.x - bubble.r}px`,
                        top: `${bubble.y - bubble.r}px`,
                        width: `${bubble.r * 2}px`,
                        height: `${bubble.r * 2}px`,
                      }}
                    >
                      <div
                        className="bg-clip-text font-semibold leading-6 [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
                        style={{
                          marginBottom: topMarginBottom,
                          fontSize: topFontSize,
                          backgroundImage:
                            {
                              1: 'linear-gradient(180deg, #F9CF72 0%, #EEA33A 100%)',
                              2: 'linear-gradient(180deg, #D3DAF4 0%, #A6B1D6 100%)',
                              3: 'linear-gradient(180deg, #E3D1B7 0%, #CDAB8A 100%)',
                            }[bubble.rank] ||
                            'linear-gradient(180deg, #D9D9D9 0%, #D9D9D9 100%)',
                        }}
                      >
                        TOP {bubble.rank}
                      </div>
                      <div
                        className="max-w-[80%] truncate font-semibold text-black"
                        style={{
                          fontSize: nameFontSize,
                          lineHeight: nameLineHeight,
                        }}
                      >
                        {bubble.name}
                      </div>
                      <div
                        className="font-semibold text-black"
                        style={{
                          fontSize: percentFontSize,
                          lineHeight: percentLineHeight,
                        }}
                      >
                        {bubble.percent}%
                      </div>
                      {bubble.rank <= 3 && (
                        <div
                          className="flex h-[26px] items-center justify-center rounded-[26px] bg-[rgba(41,107,239,0.1)] px-3 text-xs"
                          style={{
                            marginTop: topMarginBottom,
                          }}
                        >
                          TGI 100
                        </div>
                      )}
                    </motion.div>
                  );
                });
              })()}
              <motion.div
                className={clsx(
                  'group/back absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full',
                  animating && 'pointer-events-none',
                )}
                onClick={handleLevel1ToLevel0}
                style={{
                  width: CENTER_CIRCLE_SIZE,
                  height: CENTER_CIRCLE_SIZE,
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-[rgba(41,107,239,0.8)]"
                  style={{
                    opacity: level1Opacity,
                    scale: level1IndicatorScale,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      opacity: level1Progress,
                    }}
                  >
                    <motion.div className="absolute inset-0 rounded-full border border-[#93b7ff] bg-[var(--odn-primary-color)] shadow-[inset_0_0_24px_-8px_rgba(255,255,255,0.5)]" />
                    <motion.svg
                      className={clsx(
                        'absolute left-[70px] top-5 size-5 transition-all',
                        !animating && 'group-hover/back:translate-y-[5px]',
                      )}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.5817 7.90219C16.7037 8.02423 16.7037 8.22209 16.5817 8.34413L10.2177 14.7081C10.0957 14.8301 9.89784 14.8301 9.7758 14.7081L3.41184 8.34413C3.2898 8.22209 3.2898 8.02423 3.41184 7.90219L4.4725 6.84153C4.59454 6.71949 4.7924 6.71949 4.91444 6.84153L9.99677 11.9239L15.0791 6.84153C15.2011 6.71949 15.399 6.71949 15.521 6.84153L16.5817 7.90219Z"
                        fill="white"
                        fillOpacity="0.6"
                      />
                    </motion.svg>
                    <motion.svg
                      className={clsx(
                        'absolute bottom-5 left-[70px] size-5 transition-all',
                        !animating && 'group-hover/back:-translate-y-[5px]',
                      )}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.41965 12.0967C3.29762 11.9746 3.29762 11.7767 3.41965 11.6547L9.78361 5.29075C9.90565 5.16871 10.1035 5.16871 10.2256 5.29075L16.5895 11.6547C16.7116 11.7767 16.7116 11.9746 16.5895 12.0967L15.5289 13.1573C15.4068 13.2793 15.209 13.2793 15.0869 13.1573L10.0046 8.07498L4.92226 13.1573C4.80022 13.2793 4.60235 13.2793 4.48031 13.1573L3.41965 12.0967Z"
                        fill="white"
                        fillOpacity="0.6"
                      />
                    </motion.svg>
                    <motion.div
                      className={clsx(
                        'absolute left-1/2 top-1/2 line-clamp-2 w-[100px] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-center text-xl font-semibold leading-8 text-white transition-all',
                        !animating && 'group-hover/back:scale-90',
                      )}
                    >
                      {currentTagName}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="pointer-events-none absolute z-20 flex flex-col rounded-full"
              style={{
                top: TAG_OFFSET,
                left: TAG_OFFSET,
                width: TAG_SIZE,
                height: TAG_SIZE,
                x: tagHoverFillX,
                y: tagHoverFillY,
              }}
            >
              <motion.div
                className="relative z-10 mx-auto w-fit min-w-[52px] max-w-[70%] select-none pb-4 pt-5 text-[13px] leading-[22px] text-black-11"
                style={{
                  marginTop: currentTagMarginTop,
                }}
              >
                <motion.div
                  className="truncate text-center"
                  style={{
                    transformOrigin: currentTagTextPlaceholderTransformOrigin,
                    scale: level1TextPlaceholderScale,
                    opacity: level1TextPlaceholderOpacity,
                  }}
                >
                  {currentTagName}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        {createPortal(
          <motion.div
            className="absolute left-0 top-0 z-[1030] w-[290px] rounded-md bg-white p-4 text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.06)] transition-[opacity,visibility] duration-150 ease-out [filter:drop-shadow(0_3px_5px_rgba(0,0,0,0.05))_drop-shadow(0_6px_15px_rgba(0,0,0,0.05))]"
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            style={{
              opacity: PARAMS.hasPopover && popoverVisible ? 1 : 0,
              visibility: PARAMS.hasPopover && popoverVisible ? 'visible' : 'hidden',
              x: popoverX,
              y: popoverY,
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {currentHoverData?.name.replace('\n', '')}
                </div>
                <div className="text-xs text-black-8">目标人群占比</div>
              </div>
              {currentHoverData?.children.map((child, childIdx) => {
                const isHighlighted = currentHoverCategory?.childIndex === childIdx;
                return (
                  <div key={child.name} className="flex items-center justify-between">
                    <div
                      className={clsx(
                        'flex-1 truncate text-black-10',
                        isHighlighted && 'font-bold text-black-12',
                      )}
                    >
                      {child.name}
                    </div>
                    <div
                      className={clsx(
                        'shrink-0 font-semibold',
                        isHighlighted && 'font-bold text-black-12',
                      )}
                    >
                      {child.percent}%
                    </div>
                  </div>
                );
              })}
              {currentHoverTopIPs && (
                <>
                  <div className="my-1 h-px bg-black-4" />
                  <div className="flex justify-center gap-4 px-0 pb-1 pt-2">
                    {currentHoverTopIPs.slice(0, 3).map((ip, idx) => (
                      <div key={ip.name} className="flex w-[72px] flex-col items-center gap-1">
                        <div className="size-14 overflow-hidden rounded-lg">
                          <img src={ip.image} alt={ip.name} className="size-full object-cover" />
                        </div>
                        <div
                          className={clsx(
                            'text-[11px] font-semibold bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]',
                            idx === 0 && 'bg-gradient-to-b from-[#f9cf72] to-[#eea33a]',
                            idx === 1 && 'bg-gradient-to-b from-[#d3daf4] to-[#a6b1d6]',
                            idx === 2 && 'bg-gradient-to-b from-[#e3d1b7] to-[#cdab8a]',
                          )}
                        >
                          TOP{idx + 1}
                        </div>
                        <div className="max-w-full truncate text-center text-[11px] text-black-10">
                          {ip.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#"
                    className="flex cursor-pointer items-center justify-center rounded-md bg-black-2 p-2 text-xs font-semibold text-blue-6 no-underline transition-colors hover:bg-black-3"
                  >
                    洞察更多{currentHoverData?.children[currentHoverCategory?.childIndex ?? 0]?.name ?? currentHoverData?.name.replace('\n', '')} IP →
                  </a>
                </>
              )}
            </div>
          </motion.div>,
          document.body,
        )}
    </div>
  );
};

export default CrystalBallInsightVisual;
