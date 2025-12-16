

import axios from 'axios';

export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/geocode/reverse`;
  
  try {
    const response = await axios.get(apiUrl, {
      params: {
        latitude,
        longitude
      },
    });

    const proxyResponseData = response.data;

    if (proxyResponseData.status && proxyResponseData.status.code === 0 && proxyResponseData.results) {
        const results = proxyResponseData.results;
        let fullAddress = "주소 정보를 찾을 수 없습니다.";

        const roadAddrItem = results.find((item: any) => item.name === "roadaddr");
        if (roadAddrItem && roadAddrItem.land) { 
            const region = roadAddrItem.region;
            const roadName = roadAddrItem.land.name;
            const buildingNumber = roadAddrItem.land.number1;
            
            let constructedAddress = "";
            if(region.area1 && region.area1.name) constructedAddress += region.area1.name + " ";
            if(region.area2 && region.area2.name) constructedAddress += region.area2.name + " ";
            if(roadName) constructedAddress += roadName;
            if(buildingNumber) constructedAddress += " " + buildingNumber;

            if (constructedAddress.trim() !== "") {
                fullAddress = constructedAddress.trim();
            }
        }

        if (fullAddress === "주소 정보를 찾을 수 없습니다.") {
            const jibunAddrItem = results.find((item: any) => item.name === "addr");
            if (jibunAddrItem && jibunAddrItem.region && jibunAddrItem.land) {
                const region = jibunAddrItem.region;
                const landNumber1 = jibunAddrItem.land.number1;
                const landNumber2 = jibunAddrItem.land.number2;

                let constructedAddress = "";
                if(region.area1 && region.area1.name) constructedAddress += region.area1.name + " ";
                if(region.area2 && region.area2.name) constructedAddress += region.area2.name + " ";
                if(region.area3 && region.area3.name) constructedAddress += region.area3.name + " ";
                if(landNumber1) constructedAddress += landNumber1;
                if(landNumber2) constructedAddress += "-" + landNumber2;

                if (constructedAddress.trim() !== "") {
                    fullAddress = constructedAddress.trim();
                }
            }
        }
        return fullAddress;
    } else {
        return "주소 정보를 찾을 수 없습니다.";
    }

  } catch (error) {
    console.error("Error fetching address from Naver Maps API:", error);
    return "주소 정보를 불러오는 중 오류가 발생했습니다.";
  }
};
