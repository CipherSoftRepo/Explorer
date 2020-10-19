using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExplorerAPI.Models
{
    public class FileModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public string Name { get; set; }
        public bool IsFolder { get; set; }

        [ForeignKey(nameof(Parent))]
        public Guid? ParentFolderId { get; set; }

        public DateTime LastModifiedDate { get; set; }

        public virtual FileModel Parent { get; set; }
    }
}
