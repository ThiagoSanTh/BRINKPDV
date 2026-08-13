namespace PDV.Dominio.Entidades;

public static class TelefoneCliente
{
    public static string SomenteDigitos(string? telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone))
        {
            return string.Empty;
        }

        return new string(telefone.Where(char.IsDigit).ToArray());
    }

    public static string ParaWhatsApp(string? telefone)
    {
        var digitos = SomenteDigitos(telefone);

        if (digitos.Length == 10 || digitos.Length == 11)
        {
            return $"55{digitos}";
        }

        return digitos;
    }

    public static bool EhValido(string? telefone)
    {
        var whatsapp = ParaWhatsApp(telefone);
        return whatsapp.Length is >= 12 and <= 13;
    }
}
