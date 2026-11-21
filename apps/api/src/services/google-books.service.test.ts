import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractIsbn13,
  mapGoogleVolume,
  normalizeCoverUrl,
  parsePublishedYear,
  stripHtml,
} from "./google-books.service.js";

describe("extractIsbn13", () => {
  it("prefere o ISBN_13 quando existe", () => {
    const isbn = extractIsbn13([
      { type: "ISBN_10", identifier: "0306406152" },
      { type: "ISBN_13", identifier: "9780306406157" },
    ]);
    assert.equal(isbn, "9780306406157");
  });

  it("converte ISBN_10 quando não há ISBN_13", () => {
    assert.equal(
      extractIsbn13([{ type: "ISBN_10", identifier: "0306406152" }]),
      "9780306406157",
    );
  });

  it("ignora identificadores inválidos e de outros tipos", () => {
    assert.equal(
      extractIsbn13([
        { type: "ISBN_13", identifier: "9780306406158" }, // dígito verificador errado
        { type: "OTHER", identifier: "PKEY:123" },
      ]),
      null,
    );
    assert.equal(extractIsbn13(undefined), null);
  });
});

describe("normalizeCoverUrl", () => {
  it("força https e remove edge=curl", () => {
    const url = normalizeCoverUrl(
      "http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    );
    assert.ok(url);
    assert.ok(url.startsWith("https://books.google.com/"));
    assert.ok(!url.includes("edge="));
    assert.ok(url.includes("zoom=1"));
  });

  it("rejeita hosts que não são do Google", () => {
    assert.equal(normalizeCoverUrl("https://rastreador.exemplo.com/pixel.png"), undefined);
    assert.equal(normalizeCoverUrl("https://books.google.com.evil.com/x.png"), undefined);
  });

  it("devolve undefined para vazio ou URL inválida", () => {
    assert.equal(normalizeCoverUrl(undefined), undefined);
    assert.equal(normalizeCoverUrl("não é url"), undefined);
  });
});

describe("stripHtml", () => {
  it("remove tags e preserva quebras de linha de parágrafos", () => {
    assert.equal(stripHtml("<p>Olá,<br>mundo</p>  <b>forte</b>"), "Olá,\nmundo\nforte");
  });

  it("devolve undefined quando sobra nada", () => {
    assert.equal(stripHtml("<p> </p>"), undefined);
    assert.equal(stripHtml(undefined), undefined);
  });
});

describe("parsePublishedYear", () => {
  it("extrai o ano de datas parciais ou completas", () => {
    assert.equal(parsePublishedYear("2019"), 2019);
    assert.equal(parsePublishedYear("2019-05"), 2019);
    assert.equal(parsePublishedYear("2019-05-20"), 2019);
  });

  it("rejeita lixo e anos implausíveis", () => {
    assert.equal(parsePublishedYear("abc"), undefined);
    assert.equal(parsePublishedYear("0000"), undefined);
    assert.equal(parsePublishedYear("9999"), undefined);
    assert.equal(parsePublishedYear(undefined), undefined);
  });
});

describe("mapGoogleVolume", () => {
  const validVolume = {
    id: "vol123",
    volumeInfo: {
      title: "  O Senhor dos Anéis ",
      subtitle: "A Sociedade do Anel",
      authors: ["J. R. R. Tolkien"],
      description: "<p>Uma <b>jornada</b>.</p>",
      publishedDate: "2001-06",
      imageLinks: {
        thumbnail: "http://books.google.com/books/content?id=vol123&edge=curl",
      },
      industryIdentifiers: [{ type: "ISBN_13", identifier: "9788533613379" }],
    },
  };

  it("converte um volume completo para o contrato do catálogo", () => {
    const book = mapGoogleVolume(validVolume);
    assert.ok(book);
    assert.equal(book.isbn13, "9788533613379");
    assert.equal(book.googleBooksId, "vol123");
    assert.equal(book.title, "O Senhor dos Anéis");
    assert.equal(book.subtitle, "A Sociedade do Anel");
    assert.deepEqual(book.authors, ["J. R. R. Tolkien"]);
    assert.equal(book.synopsis, "Uma jornada.");
    assert.equal(book.publishedYear, 2001);
    assert.ok(book.coverUrl?.startsWith("https://"));
  });

  it("não inclui nenhum campo de curadoria", () => {
    const book = mapGoogleVolume(validVolume);
    assert.ok(book);
    assert.equal("hasImprimatur" in book, false);
    assert.equal("adequacyStatus" in book, false);
  });

  it("usa um autor padrão quando a Google não informa autores", () => {
    const book = mapGoogleVolume({
      id: "v",
      volumeInfo: {
        title: "Sem autor",
        industryIdentifiers: [{ type: "ISBN_13", identifier: "9780306406157" }],
      },
    });
    assert.deepEqual(book?.authors, ["Autor não informado"]);
  });

  it("descarta itens sem ISBN válido ou sem título", () => {
    assert.equal(mapGoogleVolume({ id: "v", volumeInfo: { title: "Sem ISBN" } }), null);
    assert.equal(
      mapGoogleVolume({
        id: "v",
        volumeInfo: {
          industryIdentifiers: [{ type: "ISBN_13", identifier: "9780306406157" }],
        },
      }),
      null,
    );
  });

  it("descarta formatos inesperados sem lançar exceção", () => {
    assert.equal(mapGoogleVolume(null), null);
    assert.equal(mapGoogleVolume("texto"), null);
    assert.equal(mapGoogleVolume({ id: 123 }), null);
  });
});
