export interface Station {
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
}

export const wuhanStations: Station[] = [
  {
    name: '西藏踢踢【武汉】轻工大学站',
    address: '湖北省武汉市东西湖区公园南路常青花园14区', // 更正：这个地址现在分配给长港路站
    phoneNumber: '未知',
    latitude: 30.635848, // 常青花园14区附近经纬度估算
    longitude: 114.238491,
  },
  {
    name: '西藏踢踢【武汉】汉口火车站',
    address: '湖北省武汉市江汉区前进街街道京汉大道514号(友谊路地铁站B口步行470米)',
    phoneNumber: '未知',
    latitude: 30.608678, // 友谊路地铁站B口附近经纬度估算
    longitude: 114.264426,
  },
  {
    name: '西藏踢踢【武汉】宝丰站',
    address: '江汉区金墩街',
    phoneNumber: '未知',
    latitude: 30.589839, // 金墩街附近经纬度估算
    longitude: 114.270404,
  },
  {
    name: '西藏踢踢【武汉】创业街站',
    address: '湖北省武汉市洪山区珞喻东路关东康居园',
    phoneNumber: '未知',
    latitude: 30.518600, // 珞喻东路关东康居园附近经纬度估算
    longitude: 114.407600,
  },
  {
    name: '西藏踢踢【武汉】虎泉站',
    address: '湖北省武汉市洪山区虎泉街99号',
    phoneNumber: '未知',
    latitude: 30.506546, // 虎泉街99号附近经纬度估算
    longitude: 114.367852,
  },
  {
    name: '西藏踢踢【武汉】司门口站',
    address: '湖北省武汉市武昌区电业小区东北1门旁(积玉桥地铁站C口步行380米)',
    phoneNumber: '未知',
    latitude: 30.559560, // 积玉桥地铁站C口附近经纬度估算
    longitude: 114.305600,
  },
  {
    name: '西藏踢踢【武汉】昙华林站',
    address: '湖北省武汉市武昌区黄鹤楼街道彭刘杨路228号金榜名苑',
    phoneNumber: '未知',
    latitude: 30.552800, // 彭刘杨路228号金榜名苑附近经纬度估算
    longitude: 114.316000,
  },
  {
    name: '西藏踢踢【武汉】众圆广场站',
    address: '湖北省武汉市青山区建设一路3号',
    phoneNumber: '未知',
    latitude: 30.630000, // 建设一路3号附近经纬度估算 (众圆广场所在地)
    longitude: 114.405000,
  },
  {
    name: '西藏踢踢【武汉】中南路站',
    address: '武昌区梅苑路',
    phoneNumber: '未知',
    latitude: 30.556000, // 梅苑路附近经纬度估算 (靠近中南路)
    longitude: 114.335000,
  },
  {
    name: '西藏踢踢【武汉】花山站',
    address: '洪山区花福街',
    phoneNumber: '未知',
    latitude: 30.589000, // 花福街附近经纬度估算
    longitude: 114.426000,
  },
  {
    name: '西藏踢踢【武汉】长港路站',
    address: '江汉区常青五路60号', // 更正：这个地址现在分配给轻工大学站
    phoneNumber: '未知',
    latitude: 30.635800, // 常青五路60号附近经纬度估算 (武汉轻工大学常青校区)
    longitude: 114.225500,
  },
  {
    name: '西藏踢踢【武汉】佛祖岭站',
    address: '湖北省武汉市江夏区康魅路当代国际城',
    phoneNumber: '未知',
    latitude: 30.435000, // 康魅路当代国际城附近经纬度估算
    longitude: 114.402000,
  },
  {
    name: '西藏踢踢【武汉】长丰站',
    address: '湖北省武汉市硚口区古田二路与古田路交汇处西北',
    phoneNumber: '未知',
    latitude: 30.590000, // 古田二路与古田路交汇处西北附近经纬度估算
    longitude: 114.192000,
  },
  // 以下站点名称在提供的13个地址被唯一分配后，没有剩余的地址可以再分配。
  // 因此，这些站点在现有数据下无法获得唯一的地址。
  // 如果需要它们有地址，请提供新的、未使用的地址。
  // {
  //   name: '西藏踢踢【武汉】红钢城站',
  //   address: '无可用唯一地址', // 建设一路3号已被众圆广场站使用
  //   phoneNumber: '未知',
  //   latitude: null,
  //   longitude: null,
  // },
  // {
  //   name: '西藏踢踢【武汉】武广国际站V', // V可能只是一个多余字符或内部标识
  //   address: '无可用唯一地址', // 所有江汉区地址已分配
  //   phoneNumber: '未知',
  //   latitude: null,
  //   longitude: null,
  // },
  // {
  //   name: '西藏踢踢【武汉】县华林站V', // 假设是昙华林站的另一种表达，但地址已分配
  //   address: '无可用唯一地址',
  //   phoneNumber: '未知',
  //   latitude: null,
  //   longitude: null,
  // },
  // {
  //   name: '西藏踢踢【武汉】中南路站。', // 假设是中南路站的另一种表达，但地址已分配
  //   address: '无可用唯一地址',
  //   phoneNumber: '未知',
  //   latitude: null,
  //   longitude: null,
  // },
];
