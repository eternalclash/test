exports.handler = async function(event, context) {
    const API_KEY = process.env.API_KEY;
    
    // 이 위치에서 API 키를 이용한 작업을 수행합니다.
    // 예를 들어, 특정 API를 호출하고 그 결과를 반환할 수 있습니다.
    
    // 예제 응답
    return {
        statusCode: 200,
        body: JSON.stringify({message: "success"})
    }
}
