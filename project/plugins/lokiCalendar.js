const fetchPath = './db.json';
// fetch(fetchPath, { method: 'GET' })
//     .then((response) => {
//         console.log(response);
//         return response.json();
//     .then((json) => console.log(json.nationalHolodays));

let nationalHoliday, pallet, booked;

fetchData();

async function fetchData() {
    const response = await fetch(fetchPath, { method: "GET" });
    const json = await response.json();
    ({ nationalHoliday, pallet, booked } = json);
    // console.log(json);
}