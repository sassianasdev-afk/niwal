const MAX_EMBEDS = 10; // Discord limit per message (1 summary + product embeds)
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

const sendWebhook = async (payload) => {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('DISCORD_WEBHOOK_URL is not set, skipping Discord notification');
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = await response.text();
            console.log(`Discord webhook failed (${response.status}): ${body}`);
        }
    } catch (error) {
        console.log('Discord webhook error:', error.message);
    } finally {
        clearTimeout(timeout);
    }
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

const notifyNewOrder = async (order) => {
    try {
        const items = Array.isArray(order.items) ? order.items : [];
        const orderId = String(order._id);
        const shortId = orderId.slice(-6).toUpperCase();
        const tableLabel = order.tableNumber
            ? `Table #${order.tableNumber}`
            : (order.tableId ? `Table ${order.tableId}` : 'Sans table');
        const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        const summaryLines = [
            `📍 **Table:** **${tableLabel}**`,
            ...buildCustomerLines(order.address),
            '',
            '**Summary:**',
            `• Items Count: ${itemCount}`,
            `• **Total:** **${formatPrice(order.amount)}**`,
            `• Date: ${formatDate(order.date)}`,
            `• Status: ${order.status || 'received'}`,
        ];

        // Products beyond the embed limit are still listed in the summary so nothing is lost
        const extraItems = items.slice(MAX_EMBEDS - 1);
        if (extraItems.length > 0) {
            const extraLines = extraItems.map((item) => {
                const quantity = Number(item.quantity) || 0;
                const size = item.size && item.size !== 'default' ? ` (${item.size})` : '';
                return `• ${item.name}${size} × ${quantity} — ${formatPrice(Number(item.price || 0) * quantity)}`;
            });
            summaryLines.push('', '📦 **Autres articles:**', ...extraLines);
        }

        // 1) Main embed: table / customer / summary
        const summaryEmbed = {
            title: '🛒 NEW ORDER RECEIVED - Espresso Shot',
            description: truncate(summaryLines.join('\n'), 4000),
            color: EMBED_COLOR,
            footer: { text: `Commande #${shortId} • ${orderId}` },
            timestamp: new Date(order.date).toISOString(),
        };

        // 2) One embed per product with its image as thumbnail
        const productEmbeds = items.slice(0, MAX_EMBEDS - 1).map((item) => {
            const quantity = Number(item.quantity) || 0;
            const size = item.size && item.size !== 'default' ? `Size: **${item.size}**\n` : '';

            return {
                title: truncate(item.name || 'Article', 256),
                description: `**${size}Quantity: **${quantity}**\nPrice: ${formatPrice(Number(item.price || 0) * quantity)}**`,
                ...(item.image ? { thumbnail: { url: item.image } } : {}),
                color: EMBED_COLOR,
            };
        });

        // Everything is sent as ONE webhook message containing all embeds
        await sendWebhook({
            username: 'Espresso Shot — Commandes',
            allowed_mentions: { parse: [] },
            embeds: [summaryEmbed, ...productEmbeds],
        });
    } catch (error) {
        // Never let a notification problem break the order flow
        console.log('Discord notification error:', error.message);
    }
};

export { notifyNewOrder };
