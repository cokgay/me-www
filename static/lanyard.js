const LANYARD_WS = 'wss://api.lanyard.rest/socket';
const LANYARD_OP = {
  PRESENCE: 0,
  HELLO: 1,
  INITIALIZE: 2,
  HEARTBEAT: 3,
};
const EVENTS_TO_CALLBACK = ['INIT_STATE', 'PRESENCE_UPDATE'];

const initializeLanyard = (discord_id, callback) => {
  if (discord_id === '') {
    return;
  }

  let ws = new WebSocket(LANYARD_WS);

  ws.onmessage = ({ data }) => {
    const received = JSON.parse(data);

    switch (received.op) {
      case LANYARD_OP.HELLO: {
        ws.send(JSON.stringify({ op: LANYARD_OP.INITIALIZE, d: { subscribe_to_id: discord_id } }));

        setInterval(() => {
          ws.send(JSON.stringify({ op: LANYARD_OP.HEARTBEAT }));
        }, 1000 * 30);
      }

      case LANYARD_OP.PRESENCE: {
        if (EVENTS_TO_CALLBACK.includes(received.t)) {
          callback(discord_id, received.d);
        }
      }
    }
  };
};
