using System;

namespace backend.DTOs
{
    public class StandardResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public Object Data { get; set; }

        public StandardResponse(int statusCode, string message, Object content)
        {
            StatusCode = statusCode;
            Message = message;
            Data = content;
        }
    }
}
