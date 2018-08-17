// export default function checkStatus(response) {
//     if(response.ok){
//         console.log('abc: ', response);
//         return response;
//     }else{
//         let error = new Error(response.statusText);
//         error.response = response;
//         throw error;
//     }
// };

var ApiUtils = {  
    checkStatus: function(response) {
      if (response.ok) {
        return response;
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }
  };
  export { ApiUtils as default };

