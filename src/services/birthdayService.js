async function getBirthdayPeopleFromDB() {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    // Burada DB sorgusu olacak
    return [
      {
        first_name: "Test",
        last_name: "User",
        phone_number: "5551234567",
        custom_message: "🎂 Doğum günün kutlu olsun Test!"
      }
    ];
  } catch (error) {
    console.error('❌ Hata:', error);
    return [];
  }
}

module.exports = { getBirthdayPeopleFromDB };
