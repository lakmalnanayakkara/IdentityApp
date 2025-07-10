namespace backend.DTOs.Accounts
{
    public class FacebookResultDTO
    {
        public FacebookData Data { get; set; }
    }

    public class FacebookData
    {
        public bool Is_Valid { get; set; }
        public string User_Id { get; set; }
    }
}
