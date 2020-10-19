using System;

namespace ExplorerAPI.Models
{
    public class FileModelBMO
    {
        public string Name { get; set; }
        public bool IsFolder { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}
