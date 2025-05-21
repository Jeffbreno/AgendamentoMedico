using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgendamentoMedico.API.Helpers
{
    public class TimeSpanConverter : JsonConverter<TimeSpan>
    {
        public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (TimeSpan.TryParseExact(value, "hh\\:mm", null, out var result))
            {
                return result;
            }
            throw new JsonException($"Formato de hora inválido. Use 'HH:mm'. Valor recebido: {value}");
        }

        public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("hh\\:mm"));
        }
    }
}