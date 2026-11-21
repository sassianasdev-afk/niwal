const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

const MAX_EMBEDS = 10; // Discord hard limit per message
const FIRST_PAGE_ITEMS = MAX_EMBEDS - 1; // summary embed + 9 products
const NEXT_PAGE_ITEMS = MAX_EMBEDS; // 10 products per follow-up message
const EMBED_COLOR = 3066993; // Green

const truncate = (value, max) => {
    const text = String(value ?? '');
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} DH`;

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
        timeZone: 'Africa/Casablanca',
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

const buildCustomerLines = (address) => {
    if (!address) {
        return [];
    }

    if (typeof address === 'string') {
        return [`🏠 **Address:** ${address}`];
    }

    const lines = [];

    if (address.fullName) {
        lines.push(`👤 **Customer:** ${address.fullName}`);
    }
    if (address.phoneNumber) {
        lines.push(`📞 **Phone:** ${address.phoneNumber}`);
    }

    const addressParts = [address.area, address.city, address.state].filter(Boolean).join(', ');
    if (addressParts || address.pincode) {
        lines.push(`🏠 **Address:** ${addressParts}${address.pincode ? ` (Pincode: ${address.pincode})` : ''}`);
    }

    return lines;
};

const buildSummaryEmbed = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const tableLabel = order.tableNumber
        ? `Table #${order.tableNumber}`
        : (order.tableId ? `Table ${order.tableId}` : 'Sans table');
    const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    const summaryLines = [
        `📍 **Table:** ${tableLabel}`,
        ...buildCustomerLines(order.address),
        '',
        '**Summary:**',
        `• Items Count: ${itemCount}`,
        `• **Total: ${formatPrice(order.amount)}**`,
        `• **Date: ${formatDate(order.date)}**`,
        `• Status: ${order.status || 'received'}`,
    ];

    return {
        title: '🛒 NEW ORDER RECEIVED - Espresso Shot',
        description: truncate(summaryLines.join('\n'), 4000),
        color: EMBED_COLOR,
        footer: { text: `Commande #${String(order.orderId).slice(-6).toUpperCase()} • ${order.orderId}` },
        timestamp: new Date(order.date).toISOString(),
    };
};

const buildProductEmbed = (item) => {
    const quantity = Number(item.quantity) || 0;
    const size = item.size && item.size !== 'default' ? `Size: **${item.size}**\n` : '';

    return {
        title: truncate(item.name || 'Article', 256),
        description: `${size}**Quantity:** **${quantity}**\nPrice: ${formatPrice(Number(item.price || 0) * quantity)}`,
        ...(item.image ? { thumbnail: { url: item.image } } : {}),
        color: EMBED_COLOR,
    };
};

const postToDiscord = async (payload) => {
    if (!WEBHOOK_URL) {
        console.warn('VITE_DISCORD_WEBHOOK_URL is not set, skipping Discord notification');
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`Discord webhook failed (${response.status}):`, body);
        }
    } catch (error) {
        console.error('Discord webhook error:', error);
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Sends the order to Discord.
 * One single message for normal orders. If there are more than 9 products,
 * follow-up messages are sent because Discord allows max 10 embeds per message.
 */
export const sendOrderToDiscord = async (order) => {
    try {
        const items = Array.isArray(order.items) ? order.items : [];
        const shortId = String(order.orderId).slice(-6).toUpperCase();

        const pages = [
            {
                embeds: [
                    buildSummaryEmbed(order),
                    ...items.slice(0, FIRST_PAGE_ITEMS).map(buildProductEmbed),
                ],
            },
        ];

        const remainingItems = items.slice(FIRST_PAGE_ITEMS);
        for (let index = 0; index < remainingItems.length; index += NEXT_PAGE_ITEMS) {
            const pageNumber = pages.length + 1;
            pages.push({
                content: `🛒 **Commande #${shortId} — suite ${pageNumber}**`,
                embeds: remainingItems.slice(index, index + NEXT_PAGE_ITEMS).map(buildProductEmbed),
            });
        }

        for (const page of pages) {
            await postToDiscord({
                username: 'Espresso Shot — Commandes',
                allowed_mentions: { parse: [] },
                ...page,
            });
        }
    } catch (error) {
        // A Discord problem must never break the customer order flow
        console.error('Discord notification error:', error);
    }
};
