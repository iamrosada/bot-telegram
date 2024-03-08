import * as dotenv from "dotenv";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as nodemailer from "nodemailer";

dotenv.config();

export default class EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.mail.ru",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      replyTo: process.env.SMTP_USER!,
    });
  }

  private readHTMLTemplate(path: string): Promise<handlebars.TemplateDelegate> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
        if (err) {
          reject(err);
        } else {
          const template = handlebars.compile(html);
          resolve(template);
        }
      });
    });
  }

  public async sendMail(message: EmailContent): Promise<void> {
    const template = await this.readHTMLTemplate(
      __dirname + "/curso_template.html"
    );
    const sender = `"Developer BoostBLZ (wbprod)" <${process.env.SMTP_USER}>`;
    const subject = "Your Purchase Course";

    let productsList = ""; // Inicializa a lista de produtos como uma string vazia

    // Verifica se há produtos na mensagem
    if (message.products && message.products.length > 0) {
      // Se houver produtos, monta a lista formatada em HTML
      productsList = message.products
        .map((product) => `<li>${product}</li>`)
        .join(""); // Transforma cada produto em um item de lista HTML
    }

    const html = template({ username: message.username, productsList }); // Passa a lista de produtos formatada para o template
    try {
      await this.transporter.sendMail({
        from: sender,
        to: message.email,
        subject: subject,
        html,
      });
      console.log("Email sent successfully to: " + message.email);
    } catch (error) {
      console.error("Error sending email to " + message.email + ": ", error);
    }
  }
}

type EmailContent = {
  email: string;
  username: string;
  fullname: string;
  products: string[];
};
