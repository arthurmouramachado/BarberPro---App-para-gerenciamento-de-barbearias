export function obterUrlFotoBarbearia(
  fotoUrl?: string | null
): string | null {

  const foto = fotoUrl?.trim();

  if (!foto) {
    return null;
  }

  // Se a API já retornou uma URL completa
  if (/^https?:\/\//i.test(foto)) {
    return foto;
  }

  // Utiliza o endereço da API 
  const baseUrl = process.env.EXPO_PUBLIC_API_URL
    ?.trim()
    .replace(/\/+$/, "");

  if (!baseUrl) {
    return null;
  }

  // Transforma /uploads/foto.jpg em
  // https://api.ngrok-free.app/uploads/foto.jpg

  const caminhoFoto = foto.replace(/^\/+/, "");

  return `${baseUrl}/${caminhoFoto}`;
}


// Remove o CEP somente da apresentação do endereço.
export function formatarEnderecoBarbearia(
  endereco?: string | null
): string {

  if (!endereco) {
    return "";
  }

  return endereco
    .replace(/\s*\(CEP:\s*\d{5}-?\d{3}\)\s*$/i, "")
    .trim();

}