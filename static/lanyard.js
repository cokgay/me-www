const LANYARD_REST = 'https://api.lanyard.rest/v1/users';

const initializeLanyard = async (discord_id, callback) => {
    let result = await fetch(`${LANYARD_REST}/${discord_id}`);
    let returned = await result.json();

    await callback(discord_id, returned.data);
};
