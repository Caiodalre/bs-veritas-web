const notificationRecipient = "bsveritascorretora@gmail.com";
const notificationSender = {
  email: "contato@bsveritas.com.br",
  name: "B&S Veritas",
} satisfies EmailAddress;

export function createQuoteNotificationMessage(quoteId: string): EmailMessageBuilder {
  return {
    to: notificationRecipient,
    from: notificationSender,
    subject: "Nova solicitação de cotação — B&S Veritas",
    text: [
      "Uma nova solicitação de cotação foi registrada com sucesso.",
      "",
      `Identificador: ${quoteId}`,
      "",
      "Consulte o banco seguro da B&S Veritas para acessar os detalhes.",
      "Esta é uma notificação automática. Não responda a este e-mail.",
    ].join("\n"),
  };
}

export async function sendQuoteNotification(
  emailBinding: SendEmail,
  quoteId: string,
): Promise<void> {
  await emailBinding.send(createQuoteNotificationMessage(quoteId));
}
