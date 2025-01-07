package websockets;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import org.jboss.logging.Logger;

@ServerEndpoint("/chat/{username}")
@ApplicationScoped
public class ChatSocket {

    private static final Logger LOG = Logger.getLogger(ChatSocket.class);

    Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        sessions.put(username, session);
        broadcast(username, "joined the chat.");
    }

    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {
        sessions.remove(username);
        broadcast(username, "left the chat.");
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username, Throwable throwable) {
        sessions.remove(username);
        LOG.error("Error for user " + username, throwable);
        broadcast(username, "left due to an error.");
    }

    @OnMessage
    public void onMessage(String message, @PathParam("username") String username) {
        broadcast(username, message);
    }

    private void broadcast(String username, String message) {
        String icon = username.substring(0, 1).toUpperCase();
        sessions.values().forEach(session -> {
            try {
                session.getAsyncRemote().sendText(String.format(
                        "{\"username\":\"%s\", \"icon\":\"%s\", \"message\":\"%s\"}",
                        username, icon, message
                ));
            } catch (Exception e) {
                LOG.error("Broadcast failed for user " + username, e);
            }
        });
    }
}
