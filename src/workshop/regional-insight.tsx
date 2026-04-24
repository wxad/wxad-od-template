'use client';

import {
  Button,
  Cascader,
  Icon,
  Input,
  RuyiLayout,
  Select,
  Tabs,
  Tooltip,
} from 'one-design-next';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// @ts-ignore
import { AoiRecommendation, DmpUserAnalysis } from '@tencent/retail-ai-lib';
import '@tencent/retail-ai-lib/dist/styles.css';
import regionalAoiRecmJson from './data/regional-aoi-recm.json';
import regionalAudiencesJson from './data/regional-audiences.json';
import regionalStorePackagesJson from './data/regional-store-packages.json';
import regionalStoresJson from './data/regional-stores.json';

interface StoreOption {
  label: string;
  value: string;
  province: string;
  city: string;
  address: string;
}

interface AoiItem {
  aoi_int_id: string;
  title: string;
  category: string;
  address: string;
  province: string;
  city: string;
  district: string;
  lat: string;
  lng: string;
  rank: number;
  score: number;
  raw_score: number;
  user_cnt: number;
  distance: number;
  aoi_polygon: string;
}

function buildRegionalCdnData(
  storesData: any,
  storePackagesData: any,
  audiencesData: any,
  aoiRecmData: any,
) {
  return {
    storeOptions: (storesData?.list || []).map((s: any) => ({
      label: s.local_store_name,
      value: s.poi_id,
      province: s.local_store_province,
      city: s.local_store_city,
      address: s.local_store_address,
    })),
    storeRaw: storesData?.list || [],
    storePackageOptions: (storePackagesData?.list || []).map((p: any) => ({
      label: p.local_store_package_name,
      value: String(p.local_store_package_id),
      storeCount: p.local_store_list?.length || 0,
    })),
    audienceOptions: (audiencesData?.items || []).map((a: any) => ({
      label: a.name,
      value: String(a.id),
      taskId: a.recommend_task_id || '',
      status: a.status,
      userCount: a.user_count,
    })),
    aoiData: aoiRecmData?.aoi_list || {},
  };
}

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const regionalInsightCdnData = buildRegionalCdnData(
  regionalStoresJson,
  regionalStorePackagesJson,
  regionalAudiencesJson,
  regionalAoiRecmJson,
);

// ─── 常量（对齐 dmp-web data.tsx） ─────────────

const MAX_RECOMMEND_COUNT = 500;
const CROWD_MAX_RECOMMEND_COUNT = 1000;
const MIN_RECOMMEND_COUNT = 1;
const RECOMMEND_COUNT_TEXT = '期望推荐数量';
const RECOMMEND_COUNT_TIPS =
  '指定推荐结果的数量上限。实际可推荐数量不足时，则返回全部可用推荐。';

const RecommendedMode = [
  { label: '常规推荐', value: 1 },
  { label: '多门店综合', value: 2 },
];

const WorkResidenceModel = [
  { label: '全部', value: 'all' },
  { label: '工作地', value: 'work' },
  { label: '居住地', value: 'home' },
];

const DistanceLimitOptions = [
  { label: '自适应', value: 1 },
  { label: '500 米', value: 500 },
  { label: '1 公里', value: 1000 },
  { label: '2 公里', value: 2000 },
  { label: '3 公里', value: 3000 },
  { label: '5 公里', value: 5000 },
  { label: '10 公里', value: 10000 },
  { label: '30 公里', value: 30000 },
  { label: '50 公里', value: 50000 },
];

const SeletionTipsMap = {
  domain: (
    <>
      <p>全部：推荐结果不区分工作地和居住地</p>
      <p>工作地：推荐结果覆盖更多的工作人群</p>
      <p>居住地：推荐结果覆盖更多的居住人群</p>
    </>
  ),
  mode: (
    <>
      <p>常规推荐：批量对一至多个门店「独立推荐」高价值 AOI</p>
      <p>多门店综合：「综合评估」多个门店的客源来推荐高价值 AOI</p>
    </>
  ),
  distance: <p>指定推荐结果的最大搜索范围</p>,
  heatMapScale: (
    <p>
      不改变查询结果和数据，仅控制地图上绘制的热力图大小。半径越大，热力图表现越连续；半径越小，热力图表现越分散
    </p>
  ),
  onePartyAnalysisTips: (
    <>
      <p>
        <span style={{ fontWeight: 600 }}>预估渗透率：</span>
        所选门店的客源人数 /
        AOI预估常到访人数，门店客源人群综合门店到访、广告转化、小程序使用等行为预估
      </p>
      <p style={{ marginTop: 20, marginBottom: 20 }}>
        <span style={{ fontWeight: 600 }}>推荐等级：</span>
        预估渗透率按每20%为1个星级。排序前20%为5星，前20%-40%为4星，以此类推
      </p>
      <p>
        <span style={{ fontWeight: 600 }}>一方人群浓度：</span>
        一方人群中AOI预估常到访人数 / AOI预估常到访总人数
      </p>
    </>
  ),
};

function getRecommendNumberError(val: number, max = MAX_RECOMMEND_COUNT) {
  if (isNaN(val) || !String(val)?.trim())
    return `${RECOMMEND_COUNT_TEXT}不能为空`;
  if (val < MIN_RECOMMEND_COUNT)
    return `${RECOMMEND_COUNT_TEXT}不能小于${MIN_RECOMMEND_COUNT}`;
  if (val > max) return `${RECOMMEND_COUNT_TEXT}不能大于${max}`;
  return '';
}

const MENU_ITEMS = [
  {
    key: 'market',
    label: '市场洞察',
    icon: 'search',
    children: [
      { key: 'compete-analysis', label: '竞争格局' },
      { key: 'search-insight', label: '搜索洞察' },
      { key: 'regional-insight', label: '区域洞察' },
    ],
  },
  {
    key: 'brand-asset',
    label: '品牌资产',
    icon: 'shield',
    children: [
      { key: 'brand-crowd-asset', label: '品牌人群资产' },
      { key: 'spu-crowd-asset', label: '商品人群资产' },
      { key: 'brand-asset-flow', label: '品牌资产流转' },
      { key: 'inner-spread', label: '域内传播' },
      { key: 'outer-spread', label: '域外扩散' },
    ],
  },
  {
    key: 'brand-mind',
    label: '品牌心智',
    icon: 'star',
    children: [
      { key: 'brand-mind-dashboard', label: '品牌心智度量' },
      { key: 'industry-opportunity-mind', label: '行业机会心智' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（相对当前页面跳转：本地开发跳本地、发布环境跳发布）
const MENU_ROUTES: Record<string, string> = {
  'compete-analysis': 'compete-analysis',
  'search-insight': 'mind',
  'regional-insight': 'regional-insight',
  'brand-crowd-asset': 'brand5r',
  'spu-crowd-asset': 'spu-audience-asset',
  'brand-asset-flow': 'asset-flow',
  'inner-spread': 'content-asset',
  'outer-spread': 'outside',
  'brand-mind-dashboard': 'brand-mind-dashboard',
  'industry-opportunity-mind': 'industry-opportunity-mind',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  首页: 'home',
  洞察诊断: 'compete-analysis',
  人群策略: 'r-zero-crowd',
  策略应用: 'insight-ip',
  全域度量: 'review',
};

function navigateNav(label: string) {
  const slug = NAV_ROUTES[label];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

const provinceCityArea = [
  { label: '不限', value: '不限' },
  {
    label: '北京市',
    value: '北京市',
    children: [
      { label: '朝阳区', value: '朝阳区' },
      { label: '海淀区', value: '海淀区' },
      { label: '东城区', value: '东城区' },
      { label: '西城区', value: '西城区' },
    ],
  },
  {
    label: '上海市',
    value: '上海市',
    children: [
      { label: '浦东新区', value: '浦东新区' },
      { label: '黄浦区', value: '黄浦区' },
      { label: '静安区', value: '静安区' },
      { label: '徐汇区', value: '徐汇区' },
    ],
  },
  {
    label: '广东省',
    value: '广东省',
    children: [
      { label: '广州市', value: '广州市' },
      { label: '深圳市', value: '深圳市' },
      { label: '佛山市', value: '佛山市' },
    ],
  },
];

// ─── 推荐等级星级（对齐 dmp-web） ─────
const STAR_COLORS = ['#296BEF', '#33D2CB', '#FCB04C', '#F5A623', '#E64545'];

function RankStars({ score }: { score: number }) {
  // score 0~1, 分5档: >=0.8 五星, >=0.6 四星, >=0.4 三星, >=0.2 二星, else 一星
  const stars =
    score >= 0.8
      ? 5
      : score >= 0.6
        ? 4
        : score >= 0.4
          ? 3
          : score >= 0.2
            ? 2
            : 1;
  const color = STAR_COLORS[5 - stars];
  return (
    <span className="flex items-center gap-px">
      {Array.from({ length: stars }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={color}>
          <path d="M6 0l1.76 3.56L12 4.16 8.88 7.08l.74 4.32L6 9.36 2.38 11.4l.74-4.32L0 4.16l4.24-.6z" />
        </svg>
      ))}
    </span>
  );
}

// ─── 右侧地图区（用腾讯地图静态图 + AOI 标记） ─────

function MapArea({
  aoiList,
  center,
}: {
  aoiList: AoiItem[];
  center: { lat: string; lng: string };
}) {
  // 腾讯地图静态图 API
  const markers = aoiList
    .slice(0, 9)
    .map((a, i) => `${a.lat},${a.lng}`)
    .join('|');
  const mapUrl = `https://apis.map.qq.com/ws/staticmap/v2/?center=${center.lat},${center.lng}&zoom=15&size=800x600&maptype=roadmap&markers=size:mid|color:0x296BEF|label:A|${markers}&key=TXNBZ-DZ2KF-GMOJB-NQXMO-BZNQF-PFBQD`;

  return (
    <div
      className="flex-1 min-w-0 relative rounded-lg overflow-hidden bg-black-1"
      style={{ height: 'calc(85vh - 20px)' }}
    >
      <img
        src={mapUrl}
        alt="地图"
        className="w-full h-full object-cover"
        onError={(e) => {
          // 静态图加载失败时显示灰底
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* AOI 多边形覆盖（简化：用半透明色块表示区域） */}
      {aoiList.slice(0, 10).map((aoi) => {
        const score = aoi.score;
        const color =
          score >= 0.8
            ? 'rgba(41,107,239,0.25)'
            : score >= 0.6
              ? 'rgba(51,210,203,0.25)'
              : score >= 0.4
                ? 'rgba(252,176,76,0.25)'
                : 'rgba(245,166,35,0.2)';
        return (
          <Tooltip
            key={aoi.aoi_int_id}
            popup={`${aoi.title} · 推荐人数 ${aoi.user_cnt.toLocaleString()}`}
          >
            <div
              className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: color,
                border: `2px solid ${color.replace('0.25', '0.6').replace('0.2', '0.5')}`,
                // 伪随机位置分布在地图区域内
                left: `${15 + ((aoi.rank * 37) % 55)}%`,
                top: `${10 + ((aoi.rank * 53) % 60)}%`,
                width: Math.max(40, Math.min(80, aoi.user_cnt / 100)),
                height: Math.max(30, Math.min(60, aoi.user_cnt / 120)),
              }}
            />
          </Tooltip>
        );
      })}
      {/* 底部地图品牌 */}
      <div className="absolute bottom-2 left-2 text-xs text-black-8 bg-white/80 px-2 py-0.5 rounded">
        腾讯地图
      </div>
    </div>
  );
}

// ─── 门店客源分析（对齐 dmp-web StoreAnalysis） ─────

function StoreAnalysis({
  active,
  cdnData,
}: {
  active: boolean;
  cdnData: typeof regionalInsightCdnData;
}) {
  const mapRef = useRef<any>(null);
  const [stores, setStores] = useState<string[]>([]);
  const [storePackageId, setStorePackageId] = useState('');
  const [storeMode, setStoreMode] = useState('STORE');
  const [recmMode, setRecmMode] = useState(1);
  const [domain, setDomain] = useState('all');
  const [distance, setDistance] = useState(1);
  const [expand, setExpand] = useState(false);
  const [recommendNumber, setRecommendNumber] = useState<string | number>(50);
  const [searched, setSearched] = useState(true);

  // 默认选中第一个门店
  useEffect(() => {
    if (cdnData?.storeOptions?.length && stores.length === 0) {
      setStores([cdnData.storeOptions[0].value]);
    }
  }, [cdnData?.storeOptions]);

  const recommendNumberError = useMemo(
    () => getRecommendNumberError(recommendNumber as number),
    [recommendNumber],
  );

  // 查询后显示 mock 的 AOI 数据
  const selectedStoreNames = useMemo(() => {
    return stores.map(
      (id) => cdnData?.storeOptions?.find((o) => o.value === id)?.label || id,
    );
  }, [stores, cdnData]);

  // 获取当前选中门店的 AOI 数据（mock：所有门店共享同一份 AOI 数据）
  const firstAoiKey = Object.keys(cdnData?.aoiData || {})[0];
  const aoiList: AoiItem[] = (cdnData?.aoiData?.[firstAoiKey] ||
    []) as AoiItem[];
  const totalUserCnt = aoiList.reduce((sum, a) => sum + (a.user_cnt || 0), 0);

  const handleSearch = useCallback(async () => {
    if (storeMode === 'STORE' && stores.length === 0) return;
    if (storeMode === 'STORE_PACKAGE' && !storePackageId) return;
    setSearched(true);
    try {
      const params: Record<string, unknown> = {
        recm_mode: recmMode,
        distance: distance > 1 ? distance / 1000 : null,
        domain: domain !== 'all' ? domain : null,
        min_user_cnt: 0,
        max_aoi_cnt: +recommendNumber || 50,
        request_source: 'ruyi',
      };
      if (storeMode === 'STORE') params.poi_list = stores;
      else params.local_store_package_id = storePackageId;
      await mapRef.current?.search?.(params);
    } catch (e) {
      console.error(e);
    }
  }, [
    stores,
    storeMode,
    storePackageId,
    recmMode,
    domain,
    distance,
    recommendNumber,
  ]);

  const onRecommendNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    setRecommendNumber(v ? +v : '');
  };

  return (
    <div>
      {/* 筛选栏（对齐 dmp-web .filterWrap） */}
      <div
        className="flex flex-wrap items-center gap-y-4 px-6 py-6 bg-white border-t border-black-4 rounded-b-lg"
      >
        <div className="flex mr-3 w-[426px]">
          <Select
            value={storeMode}
            onChange={(v) => setStoreMode(v as string)}
            options={[
              { label: '关联门店', value: 'STORE' },
              { label: '门店包', value: 'STORE_PACKAGE' },
            ]}
            className="w-[110px] shrink-0"
          />
          {storeMode === 'STORE' ? (
            <Select
              mode="multiple"
              value={stores}
              onChange={(v) => setStores(v as string[])}
              options={cdnData?.storeOptions || []}
              placeholder="请选择关联门店"
              showSearch
              maxTagCount={1}
              className="-ml-px flex-1"
            />
          ) : (
            <Select
              value={storePackageId || undefined}
              onChange={(v) => setStorePackageId(v as string)}
              options={cdnData?.storePackageOptions || []}
              placeholder="请选择门店包"
              showSearch
              className="-ml-px flex-1"
            />
          )}
        </div>

        <Tooltip popup={SeletionTipsMap.mode}>
          <div className="mr-3">
            <Select
              value={recmMode}
              onChange={(v) => setRecmMode(v as number)}
              options={RecommendedMode}
              prefix="推荐模式"
              className="w-[200px]"
            />
          </div>
        </Tooltip>

        <Tooltip popup={RECOMMEND_COUNT_TIPS}>
          <div className="mr-3">
            <Input
              value={String(recommendNumber)}
              onChange={onRecommendNumberChange}
              placeholder={`${MIN_RECOMMEND_COUNT}~${MAX_RECOMMEND_COUNT}`}
              leftElement={
                <span className="text-black-10 text-sm whitespace-nowrap pl-1">
                  {RECOMMEND_COUNT_TEXT}
                </span>
              }
              className="w-[250px]"
            />
          </div>
        </Tooltip>

        {expand ? (
          <>
            <Tooltip popup={SeletionTipsMap.domain}>
              <div className="mr-3">
                <Select
                  value={domain}
                  onChange={(v) => setDomain(v as string)}
                  options={WorkResidenceModel}
                  prefix="职住模式"
                  className="w-[200px]"
                />
              </div>
            </Tooltip>
            <Tooltip popup={SeletionTipsMap.distance}>
              <div className="mr-3">
                <Select
                  value={distance}
                  onChange={(v) => setDistance(v as number)}
                  options={DistanceLimitOptions}
                  prefix="距离限制"
                  className="w-[200px]"
                />
              </div>
            </Tooltip>
            <Button
              className="mr-3"
              onClick={() => setExpand(false)}
            >
              收起
            </Button>
          </>
        ) : (
          <Button className="mr-3" onClick={() => setExpand(true)}>
            高级设置
          </Button>
        )}

        <Button intent="primary" className="w-20" onClick={handleSearch}>
          查询
        </Button>
      </div>

      {/* 结果区域（对齐截图：左面板 + 右地图） */}
      {searched && aoiList.length > 0 && (
        <div className="flex gap-3 mt-4">
          <div
            className="flex-1 min-w-0 relative rounded-lg overflow-hidden"
            style={{ height: 'calc(85vh - 20px)' }}
          >
            <AoiRecommendation
              ref={mapRef}
              style={{
                width: '100%',
                height: '100%',
                background: '#fff',
                borderRadius: 8,
              }}
              recm_mode={recmMode}
              poi_list={storeMode === 'STORE' ? stores : undefined}
              local_store_package_id={
                storeMode === 'STORE_PACKAGE' ? storePackageId : undefined
              }
              distance={distance > 1 ? distance / 1000 : null}
              domain={domain !== 'all' ? domain : null}
              min_user_cnt={0}
              max_aoi_cnt={+recommendNumber || 50}
              request_source="ruyi"
              baseUrl="/cgi-bin/region"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 一方人群分析（对齐 dmp-web OnePartyAnalysis） ─────

function OnePartyAnalysis({
  active,
  cdnData,
}: {
  active: boolean;
  cdnData: typeof regionalInsightCdnData;
}) {
  const mapRef = useRef<any>(null);
  const [audienceId, setAudienceId] = useState('');
  const [area, setArea] = useState<string[]>(['不限']);
  const [domain, setDomain] = useState('all');
  const [expand, setExpand] = useState(false);
  const [heatmapScale, setHeatmapScale] = useState<string | number>(20);
  const [recommendNumber, setRecommendNumber] = useState<string | number>(500);
  const [searched, setSearched] = useState(false);

  const recommendNumberError = useMemo(
    () =>
      getRecommendNumberError(
        recommendNumber as number,
        CROWD_MAX_RECOMMEND_COUNT,
      ),
    [recommendNumber],
  );

  const onAudienceChange = (val: string) => {
    setAudienceId(val);
  };

  const handleSearch = useCallback(async () => {
    if (!audienceId) return;
    setSearched(true);
    try {
      const params: Record<string, unknown> = {
        task_id: audienceId,
        admin: area[area.length - 1] || '不限',
        mode: domain === 'all' ? 'topn' : domain,
        heatmap_scale: heatmapScale,
        request_source: 'ruyi',
        max_aoi_cnt: +recommendNumber || 500,
      };
      await mapRef.current?.search?.(params);
    } catch (e) {
      console.error(e);
    }
  }, [audienceId, area, domain, heatmapScale, recommendNumber]);

  const onRecommendNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    setRecommendNumber(v ? +v : '');
  };

  const onHeatMapScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    setHeatmapScale(v ? +v : '');
  };

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-y-4 px-6 py-6 bg-white border-t border-black-4 rounded-b-lg"
      >
        <div className="mr-3 w-[280px]">
          <Select
            value={audienceId || undefined}
            onChange={(v) => onAudienceChange(v as string)}
            options={cdnData?.audienceOptions || []}
            placeholder="请选择计算成功人群"
            showSearch
            prefix="一方人群包"
          />
        </div>

        <div className="mr-3 w-[280px]">
          <Cascader
            options={provinceCityArea}
            value={area}
            onChange={(v) => setArea(v as string[])}
            changeOnSelect
            placeholder="不限"
          />
        </div>

        <Tooltip popup={RECOMMEND_COUNT_TIPS}>
          <div className="mr-3 w-[280px]">
            <Input
              value={String(recommendNumber)}
              onChange={onRecommendNumberChange}
              placeholder={`${MIN_RECOMMEND_COUNT}~${CROWD_MAX_RECOMMEND_COUNT}`}
              leftElement={
                <span className="text-black-10 text-sm whitespace-nowrap pl-1">
                  {RECOMMEND_COUNT_TEXT}
                </span>
              }
            />
          </div>
        </Tooltip>

        {expand ? (
          <>
            <Tooltip popup={SeletionTipsMap.domain}>
              <div className="mr-3 w-[200px]">
                <Select
                  value={domain}
                  onChange={(v) => setDomain(v as string)}
                  options={WorkResidenceModel}
                  prefix="职住模式"
                />
              </div>
            </Tooltip>
            <Tooltip popup={SeletionTipsMap.heatMapScale}>
              <div className="mr-3 w-[220px]">
                <Input
                  value={String(heatmapScale)}
                  onChange={onHeatMapScaleChange}
                  leftElement={
                    <span className="text-black-10 text-sm whitespace-nowrap pl-1">
                      热力图辐射半径 (米)
                    </span>
                  }
                />
              </div>
            </Tooltip>
            <Button
              className="mr-3"
              onClick={() => setExpand(false)}
            >
              收起
            </Button>
          </>
        ) : (
          <Button className="mr-3" onClick={() => setExpand(true)}>
            高级设置
          </Button>
        )}

        <Button intent="primary" className="w-20" onClick={handleSearch}>
          查询
        </Button>
      </div>

      {active && searched && (
        <DmpUserAnalysis
          ref={mapRef}
          style={{
            width: '100%',
            height: '85vh',
            marginTop: 16,
            background: '#fff',
            borderRadius: 8,
          }}
          baseUrl="/cgi-bin/region"
        />
      )}
    </div>
  );
}

// ─── 主页面（对齐 dmp-web RegionalInsight/index.tsx） ─────

export default function RegionalInsight() {
  const cdnData = regionalInsightCdnData;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('regional-insight');
  const [tab, setTab] = useState('storeAnalysis');

  return (
    <RuyiLayout
      navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量']}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuChange={(key) => {
        setActiveMenu(key);
        navigateMenu(key);
      }}
      accountName="香奈儿/Chanel – 美妆护肤"
      accountId="ID: 20458"
    >
      <div
        className="bg-white overflow-hidden relative rounded-t-lg"
      >
        <div className="relative">
          <div
            className="px-6 bg-white rounded-t-xl"
          >
            <Tabs.Default
              items={[
                { label: '门店客源分析', value: 'storeAnalysis' },
                { label: '一方人群分析', value: 'onePartyAnalysis' },
              ]}
              value={tab}
              onChange={setTab}
              itemClassName="text-black-10 py-[18px] text-base"
              activeItemClassName="text-black-12 font-semibold"
            />
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm">
            <a
              href="https://doc.weixin.qq.com/doc/w3_AYUAjQaxACUCNm1GHUiWFSWeruouv"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0.5 px-3 py-1.5 rounded-md text-black-10 hover:bg-black-1"
            >
              <Icon name="file-text" size={20} />
              使用手册
            </a>
            <Tooltip popup={SeletionTipsMap.onePartyAnalysisTips}>
              <span className="flex items-center gap-0.5 px-3 py-1.5 rounded-md text-black-10 cursor-help hover:bg-black-1">
                <Icon name="info-circle" size={16} />
                概念说明
              </span>
            </Tooltip>
          </div>
        </div>

        <div className="pb-4">
          {tab === 'storeAnalysis' && (
            <StoreAnalysis active={tab === 'storeAnalysis'} cdnData={cdnData} />
          )}
          {tab === 'onePartyAnalysis' && (
            <OnePartyAnalysis
              active={tab === 'onePartyAnalysis'}
              cdnData={cdnData}
            />
          )}
        </div>
      </div>
    </RuyiLayout>
  );
}
