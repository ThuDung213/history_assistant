export async function getPlaceDetail(placeId) {
    console.log("Fetching mock backend for:", placeId);

    // MOCK DATA → sau này bạn thay bằng BE thật
    return {
        id: placeId,
        title: "Địa điểm: " + placeId,
        description: "Hello from mock backend! Đây là dữ liệu mô phỏng cho địa điểm " + placeId,
        images: [],
        references: [
            { title: "Mock Source", url: "https://example.com" }
        ]
    };
}
