using System;

namespace ExplorerAPI.Models
{
    public class SearchQuery
    {
        public string Query { get; set; }
        public Guid? ParentId { get; set; }
        public bool ExactMatch { get; set; }
        public bool Global { get; set; }
    }
}
