export interface Station {
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
}

export const wuhanStations: Station[] = [
  {
    name: '美团外卖(常青花园站)',
    address: '湖北省武汉市东西湖区常青花园中路11-1号',
    phoneNumber: '18812345678',
    latitude: 30.6315,
    longitude: 114.2358,
  },
  {
    name: '美团买菜(金银潭站)',
    address: '湖北省武汉市东西湖区金银潭大道1号',
    phoneNumber: '18823456789',
    latitude: 30.6420,
    longitude: 114.2490,
  },
  {
    name: '美团优选(将军路站)',
    address: '湖北省武汉市东西湖区将军路25号',
    phoneNumber: '18834567890',
    latitude: 30.6250,
    longitude: 114.2280,
  },
  {
    name: '美团站点(三民小区服务点)',
    address: '湖北省武汉市江汉区三民路12号',
    phoneNumber: '18845678901',
    latitude: 30.6198,
    longitude: 114.2555,
  },
  {
    name: '美团配送(汉口火车站)',
    address: '湖北省武汉市江汉区发展大道185号',
    phoneNumber: '18856789012',
    latitude: 30.6080,
    longitude: 114.2650,
  },
   {
    name: '美团买菜(万科高尔夫店)',
    address: '湖北省武汉市东西湖区金银潭大道96号',
    phoneNumber: '18867890123',
    latitude: 30.6455,
    longitude: 114.2178,
  }
];
